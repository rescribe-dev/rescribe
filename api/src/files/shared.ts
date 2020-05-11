import { getLogger } from 'log4js';
import { nanoid } from 'nanoid';
import { elasticClient } from '../elastic/init';
import { processFile } from '../utils/antlrBridge';
import { fileIndexName } from '../elastic/settings';
import File from '../schema/file';

const logger = getLogger();

export const indexFile = async (project: string, repository: string, branch: string, path: string, fileName: string, content: string): Promise<string> => {
  const fileData = await processFile({
    fileName,
    content,
    project,
    repository,
    branch,
    path
  });
  const currentTime = new Date().getTime();
  const id = nanoid();
  const elasticContent: File = {
    ...fileData,
    projectID: project,
    repositoryID: repository,
    branchID: branch,
    created: currentTime,
    updated: currentTime,
  };
  const indexResult = await elasticClient.index({
    id,
    index: fileIndexName,
    body: elasticContent
  });
  logger.info(`got index file result of ${JSON.stringify(indexResult.body)}`);
  return `indexed file with id ${id}`;
};
