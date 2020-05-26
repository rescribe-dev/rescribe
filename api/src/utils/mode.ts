import { configData } from './config';

export const isDebug = (): boolean => {
  return configData.DEBUG;
};

export const isProduction = (): boolean => {
  return configData.PRODUCTION;
};
