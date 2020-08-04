import { config } from 'dotenv';
import { cosmiconfig } from 'cosmiconfig';
import yaml from 'js-yaml';
import fs from 'fs';
import { promisify } from 'util';
import { isLoggedIn, setAuthToken, setUsername } from './authToken';
import { homedir } from 'os';

export const utilPath = `${homedir()}/.rescribe`;

const exists = promisify(fs.exists);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);

export const appName = 'rescribe';

interface ConfigType {
  apiURL: string;
  debug: boolean;
  websiteURL: string;
  useSecure: boolean;
  authToken: string;
  username: string;
  cacheFilePath: string;
}

export const configData: ConfigType = {
  apiURL: 'localhost:8080',
  debug: false,
  websiteURL: 'localhost:8000',
  useSecure: false,
  authToken: '',
  username: '',
  cacheFilePath: `${utilPath}/cache.yml`
};

interface CacheType {
  authToken: string;
  username: string;
  repository: string;
  repositoryOwner: string;
}

export const cacheData: CacheType = {
  authToken: '',
  username: '',
  repository: '',
  repositoryOwner: ''
};

export const writeCache = async (): Promise<void> => {
  await writeFile(configData.cacheFilePath, yaml.safeDump(cacheData));
};

const readCache = async (): Promise<void> => {
  if (await exists(configData.cacheFilePath)) {
    const file = await readFile(configData.cacheFilePath, 'utf8');
    const cache: CacheType | undefined = yaml.safeLoad(file) as CacheType | undefined;
    if (cache) {
      cacheData.repository = cache.repository;
      cacheData.repositoryOwner = cache.repositoryOwner;
      if (isLoggedIn(cache.authToken)) {
        configData.authToken = cache.authToken;
        cacheData.authToken = cache.authToken;
        configData.username = cache.username;
        cacheData.username = cache.username;
      } else {
        await setAuthToken('');
        await setUsername('');
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
  if (!(await exists(utilPath))) {
    await mkdir(utilPath, {
      recursive: true
    });
  }
  const configRes = await cosmiconfig(appName, {
    cache: true,
  }).search();
  if (!configRes || configRes.isEmpty) {
    throw new Error('no configuration found');
  }
  if (configRes.config) {
    const conf = configRes.config;
    addToConfig(conf, false);
  }
  config();
  addToConfig(process.env, true);
  await readCache();
};
