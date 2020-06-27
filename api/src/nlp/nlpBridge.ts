import axios, { AxiosInstance, AxiosError } from 'axios';
import HttpStatus from 'http-status-codes';
import { configData } from '../utils/config';

let antlrClient: AxiosInstance;

export const pingNLP = async (): Promise<boolean> => {
  try {
    const res = await antlrClient.get('/ping');
    if (res.status === HttpStatus.OK) {
      return true;
    }
    return false;
  }
  catch (err) {
    const axiosError: AxiosError = err;
    throw new Error(axiosError.message);
  }
};

export const initializeNLP = async (): Promise<boolean> => {
  if (configData.NLP_URI.length === 0) {
    throw new Error('cannot find nlp uri');
  }
  antlrClient = axios.create({
    baseURL: configData.NLP_URI,
    headers: {
      common: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
        Pragma: 'no-cache',
      },
    },
    timeout: 3000,
  });
  try {
    const res = await pingNLP();
    return res;
  }
  catch (err) {
    throw new Error(`cannot connect to nlp server: ${err.message}`);
  }
};
