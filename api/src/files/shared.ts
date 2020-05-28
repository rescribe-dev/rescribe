import { getLogger } from 'log4js';
import { elasticClient } from '../elastic/init';
import { processFile } from '../utils/antlrBridge';
import { fileIndexName } from '../elastic/settings';
import File, { FileModel, FileDB, StorageType } from '../schema/structure/file';
import { ObjectId } from 'mongodb';
import { s3Client, fileBucket, getFileKey } from '../utils/aws';
import { AccessLevel } from '../schema/auth/access';

const logger = getLogger();

export enum UpdateType {
  add = 'add',
  update = 'update'
}

export interface FileIndexArgs {
  saveContent: boolean;
  action: UpdateType;
  file: FileDB | undefined;
  location: StorageType;
  project: ObjectId;
  repository: ObjectId;
  branch: string;
  path: string;
  fileName: string;
  content: string;
  public: AccessLevel;
}

export interface SaveElasticElement {
  id: ObjectId;
  data: object;
  action: UpdateType;
}

export const saveToElastic = async (elements: SaveElasticElement[]): Promise<void> => {
  let indexBody: object[] = [];
  let updateBody: object[] = [];
  for (const element of elements) {
    if (element.action === UpdateType.add) {
      indexBody.push([{
        index: {
          _index: fileIndexName,
          _id: element.id.toHexString()
        }
      }, element.data]);
    } else if (element.action === UpdateType.update) {
      indexBody.push([{
        update: {
          _index: fileIndexName,
          _id: element.id.toHexString()
        }
      }, element.data]);
    }
  }
  indexBody = indexBody.flat();
  updateBody = updateBody.flat();
  if (indexBody.length > 0) {
    await elasticClient.bulk({
      refresh: 'true',
      body: indexBody
    });
  }
  if (updateBody.length > 0) {
    await elasticClient.bulk({
      refresh: 'true',
      body: updateBody
    });
  }
};

export const indexFile = async (args: FileIndexArgs): Promise<SaveElasticElement> => {
  if (args.action === UpdateType.update && !args.file) {
    throw new Error('file is required for update');
  }
  const id = args.action === UpdateType.add ? new ObjectId() : args.file?._id as ObjectId;
  const fileData = await processFile({
    id,
    fileName: args.fileName,
    content: args.content,
    path: args.path
  });
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
      location: args.location,
      fileLength,
      public: args.public,
      saveContent: args.saveContent
    };
    const elasticContent: File = {
      ...fileData,
      _id: undefined,
      project: args.project.toHexString(),
      repository: args.repository.toHexString(),
      branches: [args.branch],
      numBranches: 1,
      created: currentTime,
      updated: currentTime,
      location: args.location,
      path: args.path,
      public: args.public,
      fileLength
    };
    elasticElement = {
      action: args.action,
      data: elasticContent,
      id
    };
    await new FileModel(newFileDB).save();
    if (args.saveContent) {
      await s3Client.upload({
        Bucket: fileBucket,
        Key: getFileKey(args.repository, args.branch, args.path),
        Body: args.content
      }).promise();
    }
  } else if (args.action === UpdateType.update) {
    const elasticContent: object = {
      ...fileData,
      _id: undefined,
      updated: currentTime,
    };
    elasticElement = {
      action: args.action,
      data: elasticContent,
      id
    };
    await FileModel.updateOne({
      _id: id
    }, {
      fileLength,
    });
    if (args.file?.saveContent) {
      await s3Client.upload({
        Bucket: fileBucket,
        Key: getFileKey(args.repository, args.branch, args.path),
        Body: args.content
      }).promise();
    }
  } else {
    throw new Error(`invalid action ${args.action} provided`);
  }
  logger.info(`${args.action}ed file ${id.toHexString()}`);
  return elasticElement;
};
