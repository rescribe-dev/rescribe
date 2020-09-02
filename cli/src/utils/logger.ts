import { configure, getLogger, Logger } from 'log4js';
import { isDebug } from './mode';
import chalk from 'chalk';
import { appName, logPath } from './config';

export let loggerInitialized = false;

export let logger: Logger;

export const writeWarning = (message: string): void => {
  const fullMessage = `Warning: ${message}`;
  console.warn(chalk.stderr(chalk.yellow(fullMessage)));
  logger.warn(fullMessage);
};

export const writeInfo = (message: string): void => {
  console.log(message);
  logger.info(message);
};

export const writeError = (message: string): void => {
  const fullMessage = `Error: ${message}`;
  console.error(chalk.red(fullMessage));
  logger.error(message);
};

export const initializeLogger = (): void => {
  configure({
    appenders: {
      file: { type: 'file', filename: `${logPath}/logs/${appName}.logs`, maxLogSize: 500 },
      console: { type: 'console' },
      fileFilter: { type: 'logLevelFilter', appender: 'file', level: 'all' },
      consoleFilter: { type: 'logLevelFilter', appender: 'console', level: isDebug() ? 'all' : 'off' }
    },
    categories: {
      default: { appenders: ['fileFilter', 'consoleFilter'], level: 'all' }
    }
  });
  logger = getLogger();
  loggerInitialized = true;
};
