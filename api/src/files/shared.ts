import { getLogger } from 'log4js';
// import { nanoid } from 'nanoid';
// import { fileIndexName } from '../elastic/configure';
// import { elasticClient } from '../elastic/init';
// import { ElasticFile } from '../elastic/types';
import { processFile } from "../utils/antlrBridge";
import { FileOutput } from '../utils/antlrTypes';

const logger = getLogger();

/* eslint-disable @typescript-eslint/no-unused-vars */

export const indexFile = async (project: string, repository: string, branch: string, path: string, fileName: string, content: string): Promise<FileOutput> => {
  const fileData = await processFile({
    fileName,
    content,
    project,
    repository,
    branch,
    path
  });
  logger.info(fileData);
  /*
  const currentTime = new Date().getTime();
  const id = nanoid();
  const elasticContent: ElasticFile = {
    _id: id,
    project,
    content,
    path: path,
    repository: repositoryName,
    name: fileName,
    created: currentTime,
    updated: currentTime,
  };
  const indexResult = await elasticClient.index({
    index: fileIndexName,
    body: elasticContent
  });
  logger.info(`got update result of ${JSON.stringify(indexResult.body)}`);
  return `indexed file with id ${id}`;
  */
  return fileData;
};
