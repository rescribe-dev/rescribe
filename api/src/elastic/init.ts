import { Client, errors } from '@elastic/elasticsearch';
import { configData } from '../utils/config';

export let elasticClient: Client;

export const initializeElastic = (): Promise<string> => {
  if (!configData.ELASTICSEARCH_URI) {
    throw new Error('cannot find elasticsearch uri');
  }
  elasticClient = new Client({
    node: configData.ELASTICSEARCH_URI
  });
  return elasticClient.ping().then((res) => {
    return `elastic connection status ${res.statusCode}`;
  }).catch((err: errors.ElasticsearchClientError) => {
    throw new Error(err.message);
  });
};
