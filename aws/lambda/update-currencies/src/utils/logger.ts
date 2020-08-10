import { configure, getLogger, Logger } from 'log4js';
import { debug } from './config';

export const initializeLogger = (): Logger => {
  configure({
    appenders: {
      console: { type: 'console' }
    },
    categories: {
      default: { appenders: ['console'], level: debug ? 'all' : 'error' }
    }
  });
  const logger = getLogger();
  return logger;
};
