import { config } from 'dotenv';
import { cosmiconfig } from 'cosmiconfig';

export const appName = 'rescribe';

interface ConfigType {
  PORT: number;
  JWT_ISSUER: string;
  DB_NAME: string;
  WEBSITE_URL: string;
  CONNECT_ANTLR: boolean;
  CONNECT_NLP: boolean;
  DEBUG: boolean;
  PRODUCTION: boolean;
  JWT_SECRET: string;
  DB_CONNECTION_URI: string;
  ELASTICSEARCH_URI: string;
  ANTLR_URI: string;
  NLP_URI: string;
  GITHUB_APP_ID: number;
  GITHUB_PRIVATE_KEY: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
  AWS_S3_BUCKET_FILES: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  DISABLE_CACHE: boolean;
  ENABLE_INITIALIZATION: boolean;
  INITIALIZATION_KEY: string;
  SENDGRID_API_KEY: string;
  SENDGRID_MAILING_LIST_ID: string;
  RECAPTCHA_SECRET: string;
}

export const configData: ConfigType = {
  PORT: 8080,
  JWT_ISSUER: 'rescribe',
  DB_NAME: 'rescribe',
  WEBSITE_URL: 'https://rescribe.dev',
  CONNECT_ANTLR: true,
  CONNECT_NLP: true,
  DEBUG: false,
  PRODUCTION: true,
  JWT_SECRET: '',
  DB_CONNECTION_URI: '',
  ELASTICSEARCH_URI: '',
  ANTLR_URI: '',
  NLP_URI: '',
  GITHUB_APP_ID: 0,
  GITHUB_PRIVATE_KEY: '',
  REDIS_HOST: '',
  REDIS_PORT: 0,
  REDIS_PASSWORD: '',
  AWS_S3_BUCKET_FILES: 'rescribe-repositories',
  AWS_ACCESS_KEY_ID: '',
  AWS_SECRET_ACCESS_KEY: '',
  AWS_REGION: 'us-east-1',
  DISABLE_CACHE: false,
  ENABLE_INITIALIZATION: false,
  INITIALIZATION_KEY: '',
  SENDGRID_API_KEY: '',
  SENDGRID_MAILING_LIST_ID: '',
  RECAPTCHA_SECRET: ''
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
