import { config } from 'dotenv';
import { cosmiconfig } from 'cosmiconfig';

export const appName = 'rescribe';

interface ConfigType {
  PORT: number;
  JWT_ISSUER: string;
  DB_NAME: string;
  WEBSITE_URL: string;
  CONNECT_ANTLR: boolean;
  DEBUG: boolean;
  JWT_SECRET: string;
  DB_CONNECTION_URI: string;
  ELASTICSEARCH_URI: string;
  ANTLR_URI: string;
  GITHUB_APP_ID: number;
  GITHUB_PRIVATE_KEY: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
}

export const configData: ConfigType = {
  PORT: 8080,
  JWT_ISSUER: 'rescribe',
  DB_NAME: 'rescribe',
  WEBSITE_URL: 'https://rescribe.dev',
  CONNECT_ANTLR: true,
  DEBUG: false,
  JWT_SECRET: '',
  DB_CONNECTION_URI: '',
  ELASTICSEARCH_URI: '',
  ANTLR_URI: '',
  GITHUB_APP_ID: 0,
  GITHUB_PRIVATE_KEY: '',
  REDIS_HOST: '',
  REDIS_PORT: 0,
  REDIS_PASSWORD: ''
};

const addToConfig = (conf: any, allString: boolean): void => {
  for (const key in configData) {
    if (key in conf) {
      const currentType = typeof (configData as any)[key];
      let currentVal = conf[key];
      let givenType = typeof conf[key];
      if (allString && currentType !== givenType) {
        if (currentType === 'boolean') {
          if (currentVal === 'true') {
            currentVal = true;
            givenType = 'boolean';
          } else if (currentVal === 'false') {
            currentVal = false;
            givenType = 'boolean';
          }
        } else if (currentType === 'number') {
          currentVal = Number(currentVal);
          givenType = 'number';
        }
      }
      if (currentType !== givenType) {
        // eslint-disable-next-line no-console
        console.warn(`invalid type ${givenType} found for ${key} with type ${currentType} in config`);
      } else {
        (configData as any)[key] = currentVal;
      }
    }
  }
};

export const initializeConfig = async (): Promise<void> => {
  const configRes = await cosmiconfig(appName, {
    cache: true
  }).search();
  if (!configRes || configRes.isEmpty) {
    throw new Error('no configuration found in config');
  }
  const conf = configRes.config;
  addToConfig(conf, false);
  config();
  addToConfig(process.env, true);
};