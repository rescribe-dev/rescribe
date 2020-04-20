import { config } from 'dotenv';
import { initializeAntlr } from './antlrBridge';
import { initializeElastic } from './elaticInit';
import { initializeLogger } from './logger'
import { initializeServer } from './server';

const runAPI = () => {
  config();
  const logger = initializeLogger();
  if (!process.env.ELASTICSEARCH_URI) {
    const message = 'cannot find elasticsearch uri'
    logger.error(message)
    throw new Error(message)
  }
  let useAntlr = true
  if (process.env.CONNECT_ANTLR === 'false') {
    useAntlr = false;
  }
  if (useAntlr) {
    initializeAntlr().then(() => {
      logger.info(`connected to antlr`)
    }).catch((err: Error) => {
      throw err;
    });
  }
  initializeElastic().then(() => {
    logger.info('connected to elasticsearch')
  }).catch((err: Error) => {
    throw err;
  });
  if (!process.env.PORT) {
    const message = 'cannot find port'
    logger.error(message)
    throw new Error(message);
  }
  const port = Number(process.env.PORT)
  if (!port) {
    const message = 'port is not numeric'
    logger.error(message)
    throw new Error(message);
  }
  initializeServer(port);
};

if (!module.parent) {
  runAPI();
}

export default runAPI;
