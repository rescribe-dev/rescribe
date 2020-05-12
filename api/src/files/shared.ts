import { getLogger } from 'log4js';
import { elasticClient } from '../elastic/init';
import { processFile } from '../utils/antlrBridge';
import { fileIndexName } from '../elastic/settings';
import File, { FileModel, FileDB, StorageType } from '../schema/file';
import { ObjectId } from 'mongodb';

const logger = getLogger();

export const indexFile = async (projectID: ObjectId, repositoryID: ObjectId, branchID: ObjectId, path: string, fileName: string, content: string): Promise<string> => {
  const id = new ObjectId();
  const fileData = await processFile({
    id,
    fileName,
    content,
    path
  });
  const newFileDB: FileDB = {
    _id: id,
    projectID,
    repositoryID,
    branchID,
    path,
    location: StorageType.local,
    content
  };
  const fileCreateRes = await new FileModel(newFileDB).save();
  logger.info(`added file ${fileCreateRes.id}`);
  const currentTime = new Date().getTime();
  const elasticContent: File = {
    ...fileData,
    projectID: projectID.toHexString(),
    repositoryID: repositoryID.toHexString(),
    branchID: branchID.toHexString(),
    created: currentTime,
    updated: currentTime,
  };
  const indexResult = await elasticClient.index({
    id: id.toHexString(),
    index: fileIndexName,
    body: elasticContent
  });
  logger.info(`got index file result of ${JSON.stringify(indexResult.body)}`);
  return `indexed file with id ${id}`;
};
