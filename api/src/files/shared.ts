import { processFile } from '../antlr/antlrBridge';
import { fileIndexName, folderIndexName } from '../elastic/settings';
import File, { FileDB, BaseFileElastic, FileModel, } from '../schema/structure/file';
import { ObjectId } from 'mongodb';
import { s3Client, fileBucket, getFileKey } from '../utils/aws';
import { AccessLevel } from '../schema/users/access';
import { SaveElasticElement, bulkSaveToElastic } from '../elastic/elastic';
import AntlrFile from '../schema/antlr/file';
import { WriteMongoElement, bulkSaveToMongo } from '../db/mongo';
import checkFileExtension from '../languages/checkFileExtension';
import { FolderModel, BaseFolder, Folder, FolderDB } from '../schema/structure/folder';
import { getParentFolderPaths, baseFolderPath, baseFolderName } from '../shared/folders';
import { getFolder } from '../folders/folder.resolver';
import { createHash } from 'crypto';
import { WriteType } from '../utils/writeType';
import { Language } from '../schema/language';


const hashAlgorithm = 'sha256';

const getHash = (input: string): string => {
  return createHash(hashAlgorithm).update(input).digest('hex');
};

export interface CombinedWriteData {
  elastic: SaveElasticElement;
  mongo: WriteMongoElement;
}

interface CreateFoldersArgs {
  folderElasticWrites: SaveElasticElement[];
  folderMongoWrites: WriteMongoElement[];
  folderWrites: CombinedWriteData[];
  // this object is used to show the files written to both the elastic
  // and mongo locations, so that they can be updated at the same time
  fileWriteData: CombinedWriteData[];
  repositoryID: ObjectId;
  branch: string;
}

export const createFolders = async (args: CreateFoldersArgs): Promise<void> => {
  const baseFolder: FolderDB = await getFolder({
    repositoryID: args.repositoryID,
    path: baseFolderPath,
    name: baseFolderName
  });
  const savedFolderData: { [key: string]: FolderDB } = {};
  savedFolderData[baseFolderPath + baseFolderName] = baseFolder;
  for (const fileWrite of args.fileWriteData) {
    const fileData = fileWrite.mongo.data as unknown as FileDB;
    const fullFilePath = fileData.path + fileData.name;
    let lastFolder = baseFolder;
    for (const folderPathData of getParentFolderPaths(fullFilePath)) {
      const fullCurrentFolderPath = folderPathData.path + folderPathData.name;
      if (fullCurrentFolderPath in savedFolderData) {
        lastFolder = savedFolderData[fullCurrentFolderPath];
      } else {
        try {
          const folderData = await getFolder({
            repositoryID: args.repositoryID,
            ...folderPathData
          });
          if (!folderData.branches.includes(args.branch)) {
            FolderModel.updateOne({
              _id: folderData._id
            }, {
              $addToSet: {
                branches: args.branch
              }
            });
          }
          folderData.branches.push(args.branch);
          savedFolderData[fullCurrentFolderPath] = folderData;
          lastFolder = folderData;
          continue;
        } catch (_err) {
          // folder does not exist. add it
        }
        const folderID = new ObjectId();
        // update file write data
        fileData.folder = folderID;
        const baseFolderData: BaseFolder = {
          ...fileData,
          ...folderPathData,
          parent: lastFolder._id
        };
        // get parent folders at the end
        const elasticFolder: Folder = {
          ...baseFolderData,
          _id: undefined,
          numBranches: baseFolderData.branches.length
        };
        const elasticWrite: SaveElasticElement = {
          action: WriteType.add,
          data: elasticFolder,
          id: folderID,
          index: folderIndexName
        };
        args.folderElasticWrites.push(elasticWrite);
        const folderDataDB: FolderDB = {
          ...baseFolderData,
          _id: folderID
        };
        const mongoWrite: WriteMongoElement = {
          data: folderDataDB as unknown as Record<string, unknown>,
          action: WriteType.add
        };
        args.folderMongoWrites.push(mongoWrite);
        args.folderWrites.push({
          mongo: mongoWrite,
          elastic: elasticWrite
        });
      }
    }
  }
};

interface SaveChangesArgs {
  fileWrites: CombinedWriteData[];
  fileElasticWrites: SaveElasticElement[];
  fileMongoWrites: WriteMongoElement[];
  folderWrites: CombinedWriteData[];
  folderElasticWrites: SaveElasticElement[];
  folderMongoWrites: WriteMongoElement[];
  repositoryID: ObjectId;
  branch: string;
}

export const saveChanges = async (args: SaveChangesArgs): Promise<void> => {
  // create folders should only be run on add
  await createFolders({
    folderElasticWrites: args.folderElasticWrites,
    folderMongoWrites: args.folderMongoWrites,
    folderWrites: args.folderWrites,
    fileWriteData: args.fileWrites,
    repositoryID: args.repositoryID,
    branch: args.branch
  });
  await bulkSaveToMongo(args.folderMongoWrites, FolderModel);
  await bulkSaveToElastic(args.folderElasticWrites);
  await bulkSaveToMongo(args.fileMongoWrites, FileModel);
  await bulkSaveToElastic(args.fileElasticWrites);
};

export interface Aggregates {
  numberOfFiles: number;
  linesOfCode: number;
}

export interface FileIndexArgs {
  action: WriteType;
  repository: ObjectId;
  branch: string;
  path: string;
  fileName: string;
  content: string;
  public: AccessLevel;
  isBinary: boolean;
  fileElasticWrites: SaveElasticElement[];
  fileMongoWrites: WriteMongoElement[];
  fileWrites: CombinedWriteData[];
  aggregates: Aggregates;
}

interface IndexFileWriteArgs extends FileIndexArgs {
  id: ObjectId;
  hash: string;
  fileLength: number;
  currentTime: number;
  fileData: AntlrFile | undefined;
  hasAntlrData: boolean;
}

const indexFileAdd = async (args: IndexFileWriteArgs): Promise<void> => {
  const newFileDB: FileDB = {
    _id: args.id,
    hash: args.hash,
    hasStructure: args.hasAntlrData,
    repository: args.repository,
    branches: [args.branch],
    path: args.path,
    name: args.fileName,
    fileLength: args.fileLength,
    public: args.public,
    created: args.currentTime,
    updated: args.currentTime,
  };
  const baseElasticContent: BaseFileElastic = {
    name: args.fileName,
    nameSearch: args.fileName,
    hash: args.hash,
    content: !args.isBinary ? args.content : '',
    hasStructure: args.hasAntlrData,
    repository: args.repository,
    branches: [args.branch],
    numBranches: 1,
    created: args.currentTime,
    updated: args.currentTime,
    path: args.path,
    public: args.public,
    fileLength: args.fileLength,
    language: Language.none
  };
  let elasticContent: File | BaseFileElastic;
  if (!args.hasAntlrData) {
    elasticContent = baseElasticContent;
  } else {
    const antlrData = (args.fileData as AntlrFile);
    baseElasticContent.language = antlrData.language;
    const fileElasticContent: File = {
      ...baseElasticContent,
      ...antlrData,
      _id: undefined
    };
    elasticContent = fileElasticContent;
  }
  const elasticElement: SaveElasticElement = {
    action: args.action,
    data: elasticContent,
    index: fileIndexName,
    id: args.id
  };
  args.fileElasticWrites.push(elasticElement);
  const writeMongoElement: WriteMongoElement = {
    data: newFileDB as unknown as Record<string, unknown>,
    action: WriteType.add,
    id: newFileDB._id
  };
  args.fileMongoWrites.push(writeMongoElement);
  await s3Client.upload({
    Bucket: fileBucket,
    Key: getFileKey(args.repository, args.id),
    Body: args.content
  }).promise();

  args.fileWrites.push({
    elastic: elasticElement,
    mongo: writeMongoElement
  });

  args.aggregates.numberOfFiles++;
  args.aggregates.linesOfCode += args.fileLength;
};

interface IndexFileUpdateArgs extends IndexFileWriteArgs {
  currentFile: FileDB;
}

const indexFileUpdate = async (args: IndexFileUpdateArgs): Promise<void> => {
  let elasticContent: Record<string, unknown>;
  if (!args.hasAntlrData) {
    elasticContent = {
      _id: undefined,
      updated: args.currentTime,
      fileLength: args.fileLength,
    };
  } else {
    elasticContent = {
      ...(args.fileData as AntlrFile),
      _id: undefined,
      updated: args.currentTime,
      fileLength: args.fileLength,
      hash: args.hash
    };
  }
  elasticContent.hasStructure = args.hasAntlrData;
  if (args.isBinary) {
    elasticContent.content = args.content;
  }
  const elasticElement: SaveElasticElement = {
    action: args.action,
    data: elasticContent,
    index: fileIndexName,
    id: args.id
  };
  args.fileElasticWrites.push(elasticElement);
  const writeMongoElement: WriteMongoElement = {
    action: WriteType.update,
    id: args.id,
    data: {
      $set: {
        fileLength: args.fileLength,
      }
    }
  };
  args.fileMongoWrites.push(writeMongoElement);
  await s3Client.upload({
    Bucket: fileBucket,
    Key: getFileKey(args.repository, args.id),
    Body: args.content
  }).promise();

  args.fileWrites.push({
    elastic: elasticElement,
    mongo: writeMongoElement
  });

  args.aggregates.linesOfCode += (args.fileLength - args.currentFile.fileLength);
};

interface SingleBranchWriteArgs {
  id: ObjectId;
  branch: string;
  currentTime: number;
  fileElasticWrites: SaveElasticElement[];
  fileMongoWrites: WriteMongoElement[];
  fileWrites?: CombinedWriteData[];
  aggregates?: Aggregates;
}

const singleBranchAdd = (args: SingleBranchWriteArgs): void => {
  const elasticContent: Record<string, unknown> = {
    script: {
      source: `
        ctx._source.numBranches++;
        ctx._source.branches.add(params.branch);
        ctx._source.updated = params.currentTime;
      `,
      lang: 'painless',
      params: {
        branch: args.branch,
        currentTime: args.currentTime
      }
    }
  };
  const elasticElement: SaveElasticElement = {
    action: WriteType.update,
    data: elasticContent,
    index: fileIndexName,
    id: args.id
  };
  args.fileElasticWrites.push(elasticElement);
  const writeMongoElement: WriteMongoElement = {
    action: WriteType.update,
    id: args.id,
    data: {
      updated: args.currentTime,
      $add: {
        branches: args.branch
      }
    }
  };
  args.fileMongoWrites.push(writeMongoElement);

  if (args.fileWrites) {
    args.fileWrites.push({
      elastic: elasticElement,
      mongo: writeMongoElement
    });
  }

  if (args.aggregates) {
    args.aggregates.numberOfFiles++;
  }
};

export const singleBranchRemove = (args: SingleBranchWriteArgs): void => {
  const elasticContent: Record<string, unknown> = {
    script: {
      source: `
        ctx._source.numBranches--;
        ctx._source.branches.remove(params.branch);
        ctx._source.updated = params.currentTime;
      `,
      lang: 'painless',
      params: {
        branch: args.branch,
        currentTime: args.currentTime
      }
    }
  };
  const elasticElement: SaveElasticElement = {
    action: WriteType.update,
    data: elasticContent,
    index: fileIndexName,
    id: args.id
  };
  args.fileElasticWrites.push(elasticElement);
  const writeMongoElement: WriteMongoElement = {
    action: WriteType.update,
    id: args.id,
    data: {
      updated: args.currentTime,
      $pull: {
        branches: args.branch
      }
    }
  };
  args.fileMongoWrites.push(writeMongoElement);

  if (args.fileWrites) {
    args.fileWrites.push({
      elastic: elasticElement,
      mongo: writeMongoElement
    });
  }

  if (args.aggregates) {
    args.aggregates.numberOfFiles--;
  }
};

export const indexFile = async (args: FileIndexArgs): Promise<void> => {
  if (![WriteType.add, WriteType.update].includes(args.action)) {
    throw new Error('invalid update type provided');
  }
  let fileData: AntlrFile | undefined = undefined;
  // database request for all of the files with the same name within the repo
  const currentFile = await FileModel.findOne({
    repository: args.repository,
    name: args.fileName,
    path: args.path
  });
  let id = currentFile ? currentFile._id : new ObjectId();
  const hasAntlrData = !args.isBinary && checkFileExtension(args.fileName);
  if (hasAntlrData) {
    fileData = await processFile({
      id,
      fileName: args.fileName,
      content: args.content,
      path: args.path
    });
  }
  const currentTime = new Date().getTime();
  const fileLength = args.content.split('\n').length - 1;
  // check if file is the same as a file that is already there
  // if it is, point to it
  const hash = getHash(args.content);

  if (currentFile) {
    id = currentFile._id;
    // file already exists in location
    if (currentFile.hash === hash) {
      if (currentFile.branches.includes(args.branch)) {
        // branch is already there. continue
        return;
      }
      // hashes are the same - same file
      // just add branch
      singleBranchAdd({
        ...args,
        id,
        currentTime
      });
    } else {
      // content is different
      // run add or update
      if (currentFile.branches.includes(args.branch)) {
        // includes our branch
        if (currentFile.branches.length === 1) {
          // there is only one branch - our branch - the file can just be updated
          await indexFileUpdate({
            ...args,
            hasAntlrData,
            id,
            hash,
            fileLength,
            currentTime,
            currentFile,
            fileData
          });
        } else {
          // there are multiple branches - the file splits into a new file object
          // we're doing one branch at a time, so there will not be multiple branches with the same changes.
          await indexFileAdd({
            ...args,
            hasAntlrData,
            id: new ObjectId(),
            hash,
            fileLength,
            currentTime,
            fileData
          });
          singleBranchRemove({
            ...args,
            id,
            currentTime
          });
        }
      } else {
        await indexFileAdd({
          ...args,
          hasAntlrData,
          id: new ObjectId(),
          hash,
          fileLength,
          currentTime,
          fileData
        });
      }
    }
  } else {
    // run add
    await indexFileAdd({
      ...args,
      id,
      hasAntlrData,
      hash,
      fileLength,
      currentTime,
      fileData
    });
  }
};
