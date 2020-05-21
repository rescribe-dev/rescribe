import { getLogger } from 'log4js';
import { elasticClient } from '../elastic/init';
import { processFile } from '../utils/antlrBridge';
import { fileIndexName } from '../elastic/settings';
import File, { FileModel, FileDB, StorageType } from '../schema/structure/file';
import { ObjectId } from 'mongodb';
import { BranchModel } from '../schema/structure/branch';

const logger = getLogger();

export const indexFile = async (saveContent: boolean, location: StorageType, project: ObjectId, repository: ObjectId, branch: ObjectId, path: string, fileName: string, content: string): Promise<string> => {
  const id = new ObjectId();
  const fileData = await processFile({
    id,
    fileName,
    content,
    path
  });
  const currentTime = new Date().getTime();
  const fileLength = content.split('\n').length - 1;
  const elasticContent: File = {
    ...fileData,
    project: project.toHexString(),
    repository: repository.toHexString(),
    branch: branch.toHexString(),
    created: currentTime,
    updated: currentTime,
    location,
    path,
    fileLength
  };
  elasticContent._id = undefined;
  await elasticClient.index({
    id: id.toHexString(),
    index: fileIndexName,
    body: elasticContent
  });
  await BranchModel.updateOne({
    _id: id
  }, {
    $addToSet: {
      files: id
    }
  });
  const newFileDB: FileDB = {
    _id: id,
    project,
    repository,
    branch,
    path,
    location,
    content: '',
    fileLength
  };
  if (saveContent) {
    newFileDB.content = content;
  }
  const fileCreateRes = await new FileModel(newFileDB).save();
  await BranchModel.updateOne({
    _id: branch
  }, {
    $addToSet: {
      files: id
    }
  });
  logger.info(`added file ${fileCreateRes.id}`);
  return `indexed file with id ${id}`;
};
