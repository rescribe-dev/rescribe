import { Client } from '@elastic/elasticsearch';
import HttpStatus from 'http-status-codes';
import { getLogger } from 'log4js';
import { elasticClient } from './init';

const logger = getLogger();

export const fileIndexName = 'files';

const fileType = 'file';

const fileMappings = {
  properties: {
    id: {
      type: 'keyword'
    },
    project: {
      type: 'keyword'
    },
    repository: {
      type: 'keyword'
    },
    path: {
      type: 'text',
    },
    content: {
      type: 'text'
    },
    name: {
      type: 'keyword'
    },
    created: {
      type: 'date',
      format: 'epoch_millis'
    },
    updated: {
      type: 'date',
      format: 'epoch_millis'
    }
  }
};

const fileIndexSettings = {
  number_of_shards: 1,
  number_of_replicas: 0
};

const initializeMapping = async (indexName: string, indexSettings: object, indexMappings: object, indexType: string) => {
  const deleteRes = await elasticClient.indices.delete({
    index: indexName,
    ignore_unavailable: true
  });
  logger.info(`deleted ${fileIndexName} from elasticsearch: ${deleteRes.body.acknowledged as boolean}`);
  const createIndexRes = await elasticClient.indices.create({
    index: indexName,
    body: {
      settings: indexSettings
    }
  });
  logger.info(`created ${fileIndexName} index: ${createIndexRes.statusCode === HttpStatus.OK}`);
  const setIndexMappingsRes = await elasticClient.indices.putMapping({
    index: indexName,
    type: indexType,
    body: indexMappings,
    include_type_name: true
  });
  logger.info(`set ${indexType} mappings: ${setIndexMappingsRes.statusCode === HttpStatus.OK}`);
};

export const initializeMappings = async () => {
  await initializeMapping(fileIndexName, fileIndexSettings, fileMappings, fileType);
};
