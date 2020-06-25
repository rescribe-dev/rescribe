import { processFile } from '../utils/antlrBridge';
import { fileIndexName, folderIndexName } from '../elastic/settings';
import File, { FileDB, BaseFileElastic, FileModel, } from '../schema/structure/file';
import { ObjectId } from 'mongodb';
import { s3Client, fileBucket, getFileKey } from '../utils/aws';
import { AccessLevel } from '../schema/auth/access';
import { SaveElasticElement, bulkSaveToElastic } from '../utils/elastic';
import AntlrFile from '../schema/antlr/file';
import { WriteMongoElement, bulkSaveToMongo } from '../utils/mongo';
import checkFileExtension from '../languages/checkFileExtension';
import { FolderModel, BaseFolder, Folder, FolderDB } from '../schema/structure/folder';
import { getParentFolderPaths, baseFolderPath, baseFolderName } from '../folders/shared';
import { getFolder } from '../folders/folder.resolver';
import { createHash } from 'crypto';
import { getLogger } from 'log4js';

const logger = getLogger();

const hashAlgorithm = 'sha256';

const getHash = (input: string): string => {
  return createHash(hashAlgorithm).update(input).digest('hex');
};

export enum UpdateType {
  add = 'add',
  update = 'update',
  delete = 'delete'
}

export interface FileWriteData {
  elastic: SaveElasticElement;
  mongo: WriteMongoElement;
}

export const getFilePath = (path: string): string => {
  let filePath = path.substring(0, path.lastIndexOf('/') + 1);
  if (filePath.length > 0) {
    if (filePath[0] !== '/') {
      filePath = `/${filePath}`;
    }
    return filePath;
  }
  return '/';
};

interface CreateFoldersArgs {
  fileWriteData: FileWriteData[];
  repositoryID: ObjectId;
  branch: string;
}

interface CreateFoldersRes {
  folderElasticWrites: SaveElasticElement[];
  folderWrites: WriteMongoElement[];
}

export const createFolders = async (args: CreateFoldersArgs): Promise<CreateFoldersRes> => {
  const folderElasticWrites: SaveElasticElement[] = [];
  const folderWrites: WriteMongoElement[] = [];
  const baseFolder: FolderDB = await getFolder({
    repositoryID: args.repositoryID,
    path: baseFolderPath,
    name: baseFolderName
  });
  const savedFolderData: { [key: string]: FolderDB } = {};
  savedFolderData[baseFolderPath + baseFolderName] = baseFolder;
  for (const fileWrite of args.fileWriteData) {
    const fileData = fileWrite.mongo.data as FileDB;
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
        folderElasticWrites.push({
          action: UpdateType.add,
          data: elasticFolder,
          id: folderID,
          index: folderIndexName
        });
        const folderDataDB: FolderDB = {
          ...baseFolderData,
          _id: folderID
        };
        folderWrites.push({
          data: folderDataDB,
          action: UpdateType.add
        });
      }
    }
  }
  return {
    folderElasticWrites,
    folderWrites
  };
};

interface SaveChangesArgs {
  fileWrites: FileWriteData[];
  fileElasticWrites: SaveElasticElement[];
  fileMongoWrites: WriteMongoElement[];
  repositoryID: ObjectId;
  branch: string;
}

export const saveChanges = async (args: SaveChangesArgs): Promise<void> => {
  // create folders should only be run on add
  const folderData = await createFolders({
    fileWriteData: args.fileWrites,
    repositoryID: args.repositoryID,
    branch: args.branch
  });
  await bulkSaveToMongo(folderData.folderWrites, FolderModel);
  await bulkSaveToElastic(folderData.folderElasticWrites);
  await bulkSaveToMongo(args.fileMongoWrites, FileModel);
  await bulkSaveToElastic(args.fileElasticWrites);
};

export interface FileIndexArgs {
  action: UpdateType;
  file: FileDB | undefined;
  project: ObjectId;
  repository: ObjectId;
  branch: string;
  path: string;
  fileName: string;
  content: string;
  public: AccessLevel;
  isBinary: boolean;
  fileElasticWrites: SaveElasticElement[];
  fileMongoWrites: WriteMongoElement[];
  fileWrites: FileWriteData[];
}

export const indexFile = async (args: FileIndexArgs): Promise<void> => {
  if (args.action === UpdateType.update && !args.file) {
    throw new Error('file is required for update');
  }
  const id = args.action === UpdateType.add ? new ObjectId() : args.file?._id as ObjectId;
  let fileData: AntlrFile | undefined = undefined;
  if (!args.isBinary && checkFileExtension(args.fileName)) {
    fileData = await processFile({
      id,
      fileName: args.fileName,
      content: args.content,
      path: args.path
    });
  }
  const currentTime = new Date().getTime();
  const fileLength = args.content.split('\n').length - 1;
  // TODO - check if file is the same as a file that is already there
  // if it is, point to it somehow
  const hash = getHash(args.content);
  // database request for all of the files with the same name within the repo
  const sameFile = await FileModel.findOne({
    hash,
    name: args.fileName,
    path: args.path
  });
  if (sameFile) {
    if (sameFile.branches.includes(args.branch)) {
      logger.info('file already exists in current branch');
      return;
    }
    const elasticContent: object = {
      script: {
        source: `
          ctx._source.numBranches++;
          ctx._source.branches.add(params.branch);
          ctx._source.updated = params.currentTime;
        `,
        lang: 'painless',
        params: {
          branch: args.branch,
          currentTime
        }
      }
    };
    args.fileElasticWrites.push({
      action: UpdateType.update,
      data: elasticContent,
      index: fileIndexName,
      id
    });
    args.fileMongoWrites.push({
      action: UpdateType.update,
      id,
      data: {
        updated: currentTime,
        $add: {
          branches: args.branch
        }
      }
    });
  } else if (args.action === UpdateType.add) {
    const newFileDB: FileDB = {
      _id: id,
      hash,
      project: args.project,
      repository: args.repository,
      branches: [args.branch],
      path: args.path,
      name: args.fileName,
      fileLength,
      public: args.public,
      created: currentTime,
      updated: currentTime,
    };
    const baseElasticContent: BaseFileElastic = {
      name: args.fileName,
      hash,
      project: args.project,
      repository: args.repository,
      branches: [args.branch],
      numBranches: 1,
      created: currentTime,
      updated: currentTime,
      path: args.path,
      public: args.public,
      fileLength
    };
    let elasticContent: File | BaseFileElastic;
    if (args.isBinary) {
      elasticContent = baseElasticContent;
    } else {
      const fileElasticContent: File = {
        ...baseElasticContent,
        ...(fileData as AntlrFile),
        _id: undefined
      };
      elasticContent = fileElasticContent;
    }
    const elasticElement: SaveElasticElement = {
      action: args.action,
      data: elasticContent,
      index: fileIndexName,
      id
    };
    args.fileElasticWrites.push(elasticElement);
    const writeMongoElement: WriteMongoElement = {
      data: newFileDB,
      action: UpdateType.add,
      id: newFileDB._id
    };
    args.fileMongoWrites.push(writeMongoElement);
    await s3Client.upload({
      Bucket: fileBucket,
      Key: getFileKey(args.repository, id),
      Body: args.content
    }).promise();
    args.fileWrites.push({
      elastic: elasticElement,
      mongo: writeMongoElement
    });
  } else if (args.action === UpdateType.update) {
    let elasticContent: object;
    if (args.isBinary) {
      elasticContent = {
        _id: undefined,
        updated: currentTime,
        fileLength,
      };
    } else {
      elasticContent = {
        ...fileData,
        _id: undefined,
        updated: currentTime,
        fileLength,
      } as File;
    }
    args.fileElasticWrites.push({
      action: args.action,
      data: elasticContent,
      index: fileIndexName,
      id
    });
    args.fileMongoWrites.push({
      action: UpdateType.update,
      id,
      data: {
        fileLength,
      }
    });
    await s3Client.upload({
      Bucket: fileBucket,
      Key: getFileKey(args.repository, id),
      Body: args.content
    }).promise();
  } else {
    throw new Error(`invalid action ${args.action} provided`);
  }
};
