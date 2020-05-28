import { Client } from '@elastic/elasticsearch';
import { configData } from '../utils/config';

export let elasticClient: Client;

export const initializeElastic = async (): Promise<string> => {
  if (configData.ELASTICSEARCH_URI.length === 0) {
    throw new Error('cannot find elasticsearch uri');
  }
  elasticClient = new Client({
    node: configData.ELASTICSEARCH_URI
  });
  try {
    const res = await elasticClient.ping();
    return `elastic connection status ${res.statusCode}`;
  }
  catch (err) {
    throw new Error(err.message);
  }
};
