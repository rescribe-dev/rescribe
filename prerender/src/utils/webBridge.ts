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
  if (configData.WEBSITE_URL.length === 0) {
    throw new Error('cannot find antlr uri');
  }
  webClient = axios.create({
    baseURL: configData.WEBSITE_URL,
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