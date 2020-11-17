import axios, { AxiosInstance, AxiosError } from 'axios';
import statusCodes from 'http-status-codes';
import { configData } from '../utils/config';

export let webClient: AxiosInstance;

export const pingWeb = async (): Promise<boolean> => {
  try {
    const res = await webClient.get('/');
    if (res.status === statusCodes.OK) {
      return true;
    }
    return false;
  }
  catch (err) {
    const axiosError: AxiosError = err;
    throw new Error(axiosError.message);
  }
};

export const initializeWeb = async (): Promise<void> => {
  if (configData.WEBSITE_HOST.length === 0) {
    throw new Error('cannot find target url');
  }
  const baseURL = `http${configData.USE_SECURE ? 's' : ''}://${configData.WEBSITE_HOST}`;
  webClient = axios.create({
    baseURL,
    timeout: 3000,
  });
  try {
    await pingWeb();
  } catch (err) {
    throw new Error(`cannot connect to website ${baseURL}: ${err.message}`);
  }
};
