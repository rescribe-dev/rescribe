import { config } from 'dotenv';
import { Client } from '@elastic/elasticsearch'

let elasticClient: Client

const runAPI = () => {
  config();
  if (!process.env.ELASTICSEARCH_URI) {
    throw new Error('cannot find elasticsearch uri')
  }
  elasticClient = new Client({
    node: process.env.ELASTICSEARCH_URI
  });
  console.log(`Hello world 🚀`);
};

if (!module.parent) {
  runAPI();
}

export default runAPI;
