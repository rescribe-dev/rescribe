import { configData } from './config';

export const isDebug = (): boolean => {
  return configData.DEBUG;
};

export const isProduction = (): boolean => {
  return configData.PRODUCTION;
};

export const enableInitialization = (): boolean => {
  return configData.ENABLE_INITIALIZATION && configData.INITIALIZATION_KEY.length > 0;
};
