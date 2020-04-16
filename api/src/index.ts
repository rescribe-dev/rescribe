import { Client, errors } from '@elastic/elasticsearch';
import { config } from 'dotenv';
import { initializeAntlr } from './antlrBridge';
import { initializeServer } from './server';

let elasticClient: Client

const runAPI = () => {
  config();
  if (!process.env.ELASTICSEARCH_URI) {
    throw new Error('cannot find elasticsearch uri')
  }
  elasticClient = new Client({
    node: process.env.ELASTICSEARCH_URI
  });
  elasticClient.ping().then(res => {
    console.log(`elastic connection status ${res.statusCode}`);
  }).catch((err: errors.ElasticsearchClientError) => {
    throw new Error(err.message);
  })
  initializeAntlr().then(() => {
    if (!process.env.PORT) {
      throw new Error('cannot find port');
    }
    initializeServer(parseFloat(process.env.PORT));
  }).catch((err: Error) => {
    throw err;
  });
};

if (!module.parent) {
  runAPI();
}

export default runAPI;
