import { getLogger } from 'log4js';
import { elasticClient } from '../elastic/init';
import { processFile } from '../utils/antlrBridge';
import { fileIndexName } from '../elastic/settings';
import File, { FileModel, FileDB, StorageType } from '../schema/file';
import { ObjectId } from 'mongodb';
import { BranchModel } from '../schema/branch';

const logger = getLogger();

export const indexFile = async (saveContent: boolean, location: StorageType, projectID: ObjectId, repositoryID: ObjectId, branchID: ObjectId, path: string, fileName: string, content: string): Promise<string> => {
  const id = new ObjectId();
  const fileData = await processFile({
    id,
    fileName,
    content,
    path
  });
  const currentTime = new Date().getTime();
  const elasticContent: File = {
    ...fileData,
    projectID: projectID.toHexString(),
    repositoryID: repositoryID.toHexString(),
    branchID: branchID.toHexString(),
    created: currentTime,
    updated: currentTime,
    location,
    path
  };
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
    projectID,
    repositoryID,
    branchID,
    path,
    location,
    content: ''
  };
  if (saveContent) {
    newFileDB.content = content;
  }
  const fileCreateRes = await new FileModel(newFileDB).save();
  logger.info(`added file ${fileCreateRes.id}`);
  return `indexed file with id ${id}`;
};
