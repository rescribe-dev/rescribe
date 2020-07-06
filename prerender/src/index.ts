import { initializeServer } from './server';
import { initializeLogger } from './utils/logger';
import { initializeConfig } from './utils/config';

const runPrerender = async (): Promise<void> => {
  // initialize config and logger
  await initializeConfig();
  const logger = initializeLogger();

  try {
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
