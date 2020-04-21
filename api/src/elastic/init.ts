import { Client, errors } from '@elastic/elasticsearch';

let elasticClient: Client

export const initializeElastic = (): Promise<string> => {
  if (!process.env.ELASTICSEARCH_URI) {
    throw new Error('cannot find elasticsearch uri')
  }
  elasticClient = new Client({
    node: process.env.ELASTICSEARCH_URI
  });
  return elasticClient.ping().then((res) => {
    return `elastic connection status ${res.statusCode}`;
  }).catch((err: errors.ElasticsearchClientError) => {
    throw new Error(err.message);
  })
}

export const getElasticClient = (): Client => {
  return elasticClient;
}
