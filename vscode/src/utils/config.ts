import * as vscode from 'vscode';
import { cosmiconfig } from 'cosmiconfig';
import { isLoggedIn } from './authToken';

export const appName = 'rescribe';

interface ConfigType {
  authToken: string;
  apiURL: string;
  debug: boolean;
  websiteURL: string;
  useSecure: boolean;
}

export const configData: ConfigType = {
  apiURL: 'localhost:8080',
  debug: false,
  websiteURL: 'localhost:8000',
  useSecure: false,
  authToken: '',
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

export const initializeConfig = async (
  context: vscode.ExtensionContext
): Promise<void> => {
  const configRes = await cosmiconfig(appName, {
    cache: true,
  }).search();
  if (configRes?.isEmpty) {
    throw new Error('no configuration found in config');
  }
  if (configRes?.config) {
    const conf = configRes?.config;
    addToConfig(conf, false);
  }
  isLoggedIn(context);
};
