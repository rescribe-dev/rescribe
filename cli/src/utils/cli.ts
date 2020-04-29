import { loggerInitialized, initializeLogger, logger } from "./logger";
import { Arguments } from "yargs";

export const appName = 'rescribe';

export interface GlobalArgs {
  debug: boolean;
}

export let globalArgs: GlobalArgs;

export const beforeAction = (args: Arguments<GlobalArgs>): void => {
  globalArgs = args;
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
