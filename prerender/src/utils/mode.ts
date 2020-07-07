import { configData } from './config';

export const isDebug = (): boolean => {
  return configData.DEBUG;
};
