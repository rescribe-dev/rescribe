import { initializeDB } from './db/connect';
import { initializeElastic } from './elastic/init';
import { initializeServer } from './server';
import { initializeAntlr } from './utils/antlrBridge';
import { initializeLogger } from './utils/logger';
import { initializeGithub } from './utils/github';
import { configData, initializeConfig } from './utils/config';
import { initializeAWS } from './utils/aws';
import { initializeRedis } from './utils/redis';
import { initializeSendgrid } from './utils/sendgrid';

const runAPI = async (): Promise<void> => {
  await initializeConfig();
  const logger = initializeLogger();
  try {
    if (configData.CONNECT_ANTLR) {
      await initializeAntlr();
      logger.info('connected to antlr');
    }
    initializeGithub();
    logger.info('github client initialized');
    await initializeAWS();
    logger.info('aws initialized');
    await initializeSendgrid();
    logger.info('sendgrid connection initialized');
    await initializeElastic();
    logger.info('connected to elasticsearch');
    await initializeDB();
    logger.info('database connection set up');
    await initializeRedis();
    logger.info('connected to redis');
    await initializeServer();
    logger.info('server started');
  } catch(err) {
    logger.fatal(err.message);
  }
};

if (!module.parent) {
  runAPI();
}

export default runAPI;
