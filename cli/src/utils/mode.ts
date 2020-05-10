import { globalArgs } from './cli';
import { configData } from './config';

export const isDebug = (): boolean => {
  return globalArgs.debug || configData.debug;
};
