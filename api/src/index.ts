import { initializeDB } from './db/connect';
import { initializeElastic } from './elastic/init';
import { initializeServer } from './server';
import { initializeAntlr } from './antlr/antlrBridge';
import { initializeLogger } from './utils/logger';
import { initializeGithub } from './github/init';
import { configData, initializeConfig } from './utils/config';
import { initializeAWS } from './utils/aws';
import { initializeRedis } from './utils/redis';
import { initializeSendgrid } from './email/sendgrid';
import { initializeNLP } from './nlp/nlpBridge';
import compileEmailTemplates from './email/compileEmailTemplates';
import { checkLanguageColors } from './utils/variables';
import { initializeStripe } from './stripe/init';
import { initializeGoogleMaps } from './users/addresses/init';

const runAPI = async (): Promise<void> => {
  // initialize config and logger
  await initializeConfig();
  const logger = initializeLogger();
  logger.info('logger initialized');

  try {
    // run checks
    checkLanguageColors();
    // initialize everything else
    if (configData.CONNECT_ANTLR) {
      logger.info('start antlr initialize');
      await initializeAntlr();
      logger.info('connected to antlr');
    }
    logger.info('start github initialize');
    initializeGithub();
    logger.info('github client initialized');
    logger.info('start google maps initialize');
    initializeGoogleMaps();
    logger.info('google maps initialized');
    logger.info('start aws initialize');
    await initializeAWS();
    logger.info('aws initialized');
    logger.info('start sendgrid initialize');
    await initializeSendgrid();
    logger.info('sendgrid connection initialized');
    logger.info('start email templates initialize');
    await compileEmailTemplates();
    logger.info('email templates compiled');
    logger.info('start elastic initialize');
    await initializeElastic();
    logger.info('connected to elasticsearch');
    logger.info('start db initialize');
    await initializeDB(configData.DB_CONNECTION_URI, configData.DB_NAME);
    logger.info('database connection set up');
    logger.info('start redis initialize');
    await initializeRedis();
    logger.info('connected to redis');
    if (configData.CONNECT_NLP) {
      logger.info('start nlp initialize');
      await initializeNLP();
      logger.info('connected to nlp');
    }
    // do not connect to payment system if hosting on-prem
    if (configData.CONNECT_STRIPE) {
      logger.info('start payment system initialize');
      await initializeStripe();
      logger.info('connected to payment system');
    }
    logger.info('start server initialize');
    await initializeServer();
    logger.info('server started');
  } catch (err) {
    logger.fatal(err.message);
  }
};

if (!module.parent) {
  runAPI();
}

export default runAPI;
