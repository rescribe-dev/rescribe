import { config } from 'dotenv';

export let apiURL: string;
export let webhookSecret: string;
export let appID: number;
export let privateKey: string;

export const initializeConfig = (): void => {
  config();
  if (!process.env.API_URL){
    throw new Error('no api url provided');
  }
  apiURL = process.env.API_URL;
  if (!process.env.WEBHOOK_SECRET) {
    throw new Error('no webhook secret provided');
  }
  webhookSecret = process.env.WEBHOOK_SECRET;
  if (!process.env.APP_ID) {
    throw new Error('no app id provided');
  }
  const appIDCast = Number(process.env.APP_ID);
  if (!appIDCast) {
    throw new Error(`app id ${process.env.APP_ID} is not numeric`);
  }
  appID = appIDCast as number;
  if (!process.env.PRIVATE_KEY) {
    throw new Error('no private key provided');
  }
  privateKey = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');
};
