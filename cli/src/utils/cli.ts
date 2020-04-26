import { loggerInitialized, initializeLogger, logger } from "./logger";

export const appName = 'rescribe';

export const beforeAction = (): void => {
  if (!loggerInitialized) {
    initializeLogger();
    logger.info('initialized logger');
  }
};

export const handleBool = (input: string): boolean => {
  const boolVal = Boolean(input);
  if (!boolVal) {
    throw new Error('debug param must be a boolean');
  }
  return boolVal;
};

export const handleStringList = (input: string): string[] => {
  return input.trim().split(',');
};
