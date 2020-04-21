import { config } from 'dotenv';
import { initializeElastic } from './elastic/init';
import { initializeServer } from './server';
import { initializeAntlr } from './utils/antlrBridge';
import { initializeLogger } from './utils/logger'

const runAPI = async () => {
  config();
  const logger = initializeLogger();
  let useAntlr = true
  if (process.env.CONNECT_ANTLR === 'false') {
    useAntlr = false;
  }
  try {
    if (useAntlr) {
      await initializeAntlr()
      logger.info(`connected to antlr`)
    }
    await initializeElastic()
    logger.info('connected to elasticsearch')
    await initializeServer()
    logger.info('server started')
  } catch(err) {
    logger.fatal(err.message)
  }
};

if (!module.parent) {
  runAPI();
}

export default runAPI;
