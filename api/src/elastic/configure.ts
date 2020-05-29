/* eslint-disable @typescript-eslint/camelcase */

import HttpStatus from 'http-status-codes';
import { getLogger } from 'log4js';
import { elasticClient } from './init';
import * as settings from './settings';
import projectMappings from './structureMappings/project';
import repositoryMappings from './structureMappings/repository';
import fileMappings from './antlrMappings/file';
import { IndicesPutMapping } from '@elastic/elasticsearch/api/requestParams';

const logger = getLogger();

const initializeMapping = async (indexName: string, indexSettings: object, indexMappings: object, indexType: string, allSettings?: object): Promise<void> => {
  const deleteRes = await elasticClient.indices.delete({
    index: indexName,
    ignore_unavailable: true
  });
  logger.info(`deleted ${indexName} from elasticsearch: ${deleteRes.body.acknowledged as boolean}`);
  try {
    const createIndexRes = await elasticClient.indices.create({
      index: indexName,
      body: {
        settings: indexSettings
      }
    });
    logger.info(`created ${indexName} index: ${createIndexRes.statusCode === HttpStatus.OK}`);
  } catch(err) {
    // eslint-disable-next-line no-console
    console.error(err);
    // eslint-disable-next-line no-console
    console.log(err.meta.body.error);
    throw err;
  }
  const mappingsConfig: IndicesPutMapping = {
    index: indexName,
    type: indexType,
    body: {
      properties: indexMappings
    },
    include_type_name: true
  };
  if (allSettings) {
    mappingsConfig.body._all = allSettings;
  }
  try {
    const setIndexMappingsRes = await elasticClient.indices.putMapping(mappingsConfig);
    logger.info(`set ${indexType} mappings: ${setIndexMappingsRes.statusCode === HttpStatus.OK}`);
  } catch(err) {
    // eslint-disable-next-line no-console
    console.error(err);
    // eslint-disable-next-line no-console
    console.log(err.meta.body.error);
    throw err;
  }
};

export const initializeMappings = async (): Promise<void> => {
  await initializeMapping(settings.fileIndexName, settings.fileIndexSettings, fileMappings, settings.fileType, settings.fileAllSettings);
  await initializeMapping(settings.projectIndexName, settings.projectIndexSettings, projectMappings, settings.projectType);
  await initializeMapping(settings.repositoryIndexName, settings.repositoryIndexSettings, repositoryMappings, settings.repositoryType);
};
