export let apiURL: string;
export let appID: number;
export let privateKey: string;

export const initializeConfig = (): void => {
  if (!process.env.API_URL){
    throw new Error('no api url provided');
  }
  apiURL = process.env.API_URL;
  if (!process.env.APP_ID) {
    throw new Error('no app id provided');
  }
  const appIDCast = new Number(process.env.APP_ID);
  if (!appID) {
    throw new Error('app id is not numeric');
  }
  appID = appIDCast as number;
  if (!process.env.PRIVATE_KEY) {
    throw new Error('no private key provided');
  }
  privateKey = process.env.PRIVATE_KEY.replace('\\n', '\n');
};
