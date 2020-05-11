/* eslint-disable @typescript-eslint/camelcase */

import HttpStatus from 'http-status-codes';
import { getLogger } from 'log4js';
import { elasticClient } from './init';
import * as settings from './settings';
import * as mappings from './mappings';

const logger = getLogger();

const initializeMapping = async (indexName: string, indexSettings: object, indexMappings: object, indexType: string): Promise<void> => {
  const deleteRes = await elasticClient.indices.delete({
    index: indexName,
    ignore_unavailable: true
  });
  logger.info(`deleted ${indexName} from elasticsearch: ${deleteRes.body.acknowledged as boolean}`);
  const createIndexRes = await elasticClient.indices.create({
    index: indexName,
    body: {
      settings: indexSettings
    }
  });
  logger.info(`created ${indexName} index: ${createIndexRes.statusCode === HttpStatus.OK}`);
  const setIndexMappingsRes = await elasticClient.indices.putMapping({
    index: indexName,
    type: indexType,
    body: {
      properties: indexMappings
    },
    include_type_name: true
  });
  logger.info(`set ${indexType} mappings: ${setIndexMappingsRes.statusCode === HttpStatus.OK}`);
};

export const initializeMappings = async (): Promise<void> => {
  await initializeMapping(settings.projectIndexName, settings.projectIndexSettings, mappings.projectMappings, settings.projectType);
  await initializeMapping(settings.repositoryIndexName, settings.repositoryIndexSettings, mappings.repositoryMappings, settings.repositoryType);
  await initializeMapping(settings.branchIndexName, settings.branchIndexSettings, mappings.branchMappings, settings.repositoryType);
  await initializeMapping(settings.fileIndexName, settings.fileIndexSettings, mappings.fileMappings, settings.fileType);
};
