import { initializeServer } from './server';
import { initializeLogger } from './utils/logger';
import { initializeConfig } from './utils/config';
import { initializeWeb } from './utils/webBridge';
import { initializePuppet } from './utils/puppet';

const runPrerender = async (): Promise<void> => {
  // initialize config and logger
  await initializeConfig();
  const logger = initializeLogger();

  try {
    logger.info('web bridge initialize');
    await initializeWeb();
    logger.info('web bridge started');
    logger.info('start puppet');
    await initializePuppet();
    logger.info('puppet initialized');
    logger.info('start server initialize');
    await initializeServer();
    logger.info('server started');
  } catch (err) {
    logger.fatal(err.message);
  }
};

if (!module.parent) {
  runPrerender();
}

export default runPrerender;
