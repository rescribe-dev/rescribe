import { processFile } from '../utils/antlrBridge';
import { fileIndexName } from '../elastic/settings';
import File, { FileDB, BaseFileElastic, } from '../schema/structure/file';
import { ObjectId } from 'mongodb';
import { s3Client, fileBucket, getFileKey } from '../utils/aws';
import { AccessLevel } from '../schema/auth/access';
import { SaveElasticElement } from '../utils/elastic';
import AntlrFile from '../schema/antlr/file';
import { WriteMongoElement } from '../utils/mongo';
import checkFileExtension from '../languages/checkFileExtension';

export enum UpdateType {
  add = 'add',
  update = 'update'
}

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
  folderElasticWrites: { [key: string]: SaveElasticElement };
  fileElasticWrites: SaveElasticElement[];
  folderWrites: WriteMongoElement[];
  fileWrites: WriteMongoElement[];
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
  let elasticElement: SaveElasticElement;
  const currentTime = new Date().getTime();
  const fileLength = args.content.split('\n').length - 1;
  if (args.action === UpdateType.add) {
    const newFileDB: FileDB = {
      _id: id,
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
    elasticElement = {
      action: args.action,
      data: elasticContent,
      index: fileIndexName,
      id
    };
    args.fileWrites.push({
      data: newFileDB
    });
    await s3Client.upload({
      Bucket: fileBucket,
      Key: getFileKey(args.repository, args.branch, args.path),
      Body: args.content
    }).promise();
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
      };
    }
    elasticElement = {
      action: args.action,
      data: elasticContent,
      index: fileIndexName,
      id
    };
    args.fileWrites.push({
      data: {
        fileLength,
      }
    });
    await s3Client.upload({
      Bucket: fileBucket,
      Key: getFileKey(args.repository, args.branch, args.path),
      Body: args.content
    }).promise();
  } else {
    throw new Error(`invalid action ${args.action} provided`);
  }
  args.fileElasticWrites.push(elasticElement);
  // create additional elements for folder (if it wasn't already added)
};
