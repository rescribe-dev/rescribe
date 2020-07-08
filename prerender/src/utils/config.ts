import { config } from 'dotenv';

export const appName = 'rescribe';

interface ConfigType {
  PORT: number;
  WEBSITE_HOST: string;
  USE_SECURE: boolean
  DEBUG: boolean;
}

export const configData: ConfigType = {
  PORT: 8083,
  WEBSITE_HOST: 'static.rescribe.dev',
  USE_SECURE: true,
  DEBUG: false,
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
  config();
  addToConfig(process.env, true);
};
