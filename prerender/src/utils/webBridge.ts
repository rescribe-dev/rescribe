import axios, { AxiosInstance, AxiosError } from 'axios';
import { OK } from 'http-status-codes';
import { configData } from '../utils/config';

export let webClient: AxiosInstance;

export const pingWeb = async (): Promise<boolean> => {
  try {
    const res = await webClient.get('/');
    if (res.status === OK) {
      return true;
    }
    return false;
  }
  catch (err) {
    const axiosError: AxiosError = err;
    throw new Error(axiosError.message);
  }
};

export const initializeWeb = async (): Promise<boolean> => {
  if (configData.WEBSITE_HOST.length === 0) {
    throw new Error('cannot find target url');
  }
  webClient = axios.create({
    baseURL: `http${configData.USE_SECURE ? 's' : ''}://${configData.WEBSITE_HOST}`,
    headers: {
      common: {},
    },
    timeout: 3000,
  });
  try {
    const res = await pingWeb();
    return res;
  }
  catch (err) {
    throw new Error(`cannot connect to website: ${err.message}`);
  }
};
