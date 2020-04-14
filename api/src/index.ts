import { Client } from '@elastic/elasticsearch'
import { config } from 'dotenv';

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
    console.log(res.statusCode)
  }).catch(err => {
    console.error(err)
  })
  console.log(`Hello world 🚀`);
};

if (!module.parent) {
  runAPI();
}

export default runAPI;
