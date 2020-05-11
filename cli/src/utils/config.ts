import { config } from 'dotenv';
import { cosmiconfig } from 'cosmiconfig';
import yaml from 'js-yaml';
import fs from 'fs';
import { promisify } from 'util';
import { isLoggedIn, setAuthToken } from './authToken';

const exists = promisify(fs.exists);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

export const appName = 'rescribe';

interface ConfigType {
  apiURL: string;
  debug: boolean;
  websiteURL: string;
  useSecure: boolean;
  authToken: string;
  cacheFilePath: string;
}

export const configData: ConfigType = {
  apiURL: 'localhost:8080',
  debug: false,
  websiteURL: 'localhost:8000',
  useSecure: false,
  authToken: '',
  cacheFilePath: `.${appName}.cache.yml`
};

interface CacheType {
  authToken: string;
  project: string;
  repository: string;
}

export const cacheData: CacheType = {
  authToken: '',
  project: '',
  repository: '',
};

export const writeCache = async (): Promise<void> => {
  await writeFile(configData.cacheFilePath, yaml.safeDump(cacheData));
};

const readCache = async (): Promise<void> => {
  if (await exists(configData.cacheFilePath)) {
    const file = await readFile(configData.cacheFilePath, 'utf8');
    const cache: CacheType | undefined = yaml.safeLoad(file);
    if (cache) {
      cacheData.project = cache.project;
      cacheData.repository = cache.repository;
      if (configData.authToken.length === 0 && isLoggedIn(cache.authToken)) {
        configData.authToken = cache.authToken;
      } else {
        setAuthToken('');
      }
    } else {
      await writeCache();
    }
  } else {
    await writeCache();
  }
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
        }
      }
      if (currentType !== givenType) {
        console.warn(`invalid type ${givenType} found for ${key} in config`);
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
  if (configRes?.isEmpty) {
    throw new Error('no configuration found in config');
  }
  if (configRes?.config) {
    const conf = configRes?.config;
    addToConfig(conf, false);
  }
  config();
  addToConfig(process.env, true);
  await readCache();
};
