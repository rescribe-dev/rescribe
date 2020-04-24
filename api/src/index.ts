import { config } from 'dotenv';
import { initializeDB } from './db/connect';
import { initializeElastic } from './elastic/init';
import { initializeServer } from './server';
import { initializeAntlr } from './utils/antlrBridge';
import { initializeLogger } from './utils/logger';
import { initializeGithub } from './utils/github';

const runAPI = async (): Promise<void> => {
  config();
  const logger = initializeLogger();
  let useAntlr = true;
  if (process.env.CONNECT_ANTLR === 'false') {
    useAntlr = false;
  }
  try {
    if (useAntlr) {
      await initializeAntlr();
      logger.info('connected to antlr');
    }
    await initializeGithub();
    logger.info('github client initialized');
    await initializeElastic();
    logger.info('connected to elasticsearch');
    await initializeDB();
    logger.info('database connection set up');
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
