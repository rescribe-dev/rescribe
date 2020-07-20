import { configure, getLogger, Logger } from 'log4js';
import { isDebug } from './mode';

export const initializeLogger = (): Logger => {
  configure({
    appenders: {
      console: { type: 'console' }
    },
    categories: {
      default: { appenders: ['console'], level: isDebug() ? 'all' : 'error' }
    }
  });
  const logger = getLogger();
  return logger;
};
