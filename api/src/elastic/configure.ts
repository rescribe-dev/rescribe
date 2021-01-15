import statusCodes from 'http-status-codes';
import { getLogger } from 'log4js';
import { elasticClient } from './init';
import * as settings from './settings';
// import projectMappings from './structureMappings/project';
// import repositoryMappings from './structureMappings/repository';
// import fileMappings from './antlrMappings/file';
import { IndicesPutMapping } from '@elastic/elasticsearch/api/requestParams';
// import folderMappings from './structureMappings/folder';
import libraryMappings from './nlpMappings/library';

const logger = getLogger();

const initializeMapping = async (indexName: string, indexSettings: Record<string, unknown>, indexMappings: Record<string, unknown>, indexType: string): Promise<void> => {
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
    logger.info(`created ${indexName} index: ${createIndexRes.statusCode === statusCodes.OK}`);
  } catch(err) {
    logger.error(err.meta.body.error);
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
  try {
    const setIndexMappingsRes = await elasticClient.indices.putMapping(mappingsConfig);
    logger.info(`set ${indexType} mappings: ${setIndexMappingsRes.statusCode === statusCodes.OK}`);
  } catch(err) {
    logger.error(err.meta.body.error);
    throw err;
  }
};

export const initializeMappings = async (): Promise<string> => {
  // await initializeMapping(settings.fileIndexName, settings.fileIndexSettings, fileMappings, settings.fileType);
  // await initializeMapping(settings.folderIndexName, settings.folderIndexSettings, folderMappings, settings.folderType);
  // await initializeMapping(settings.repositoryIndexName, settings.repositoryIndexSettings, repositoryMappings, settings.repositoryType);
  // await initializeMapping(settings.projectIndexName, settings.projectIndexSettings, projectMappings, settings.projectType);

  // initialize for nlp
  await initializeMapping(settings.libraryIndexName, settings.libraryIndexSettings, libraryMappings, settings.libraryType);
  return 'initialized all mappings';
};
