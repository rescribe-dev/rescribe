import axios, { AxiosError, AxiosInstance } from 'axios';
import HttpStatus from 'http-status-codes';
import { ProcessFileInput } from './antlrTypes';
import AntlrFile from '../schema/antlr/file';
import { configData } from './config';

let antlrClient: AxiosInstance;

export const processFile = async (inputData: ProcessFileInput): Promise<AntlrFile> => {
  try {
    if (!antlrClient) {
      throw new Error('antlr client not initialized');
    }
    const res = await antlrClient.post<AntlrFile>('/processFile', inputData);
    if (res.status === HttpStatus.OK) {
      return res.data;
    }
    else {
      throw new Error(`invalid response status ${res.status}`);
    }
  }
  catch (err) {
    throw new Error(err.message);
  }
};

export const pingAntlr = (): Promise<boolean> => {
  return antlrClient.get('/ping').then(res => {
    if (res.status === HttpStatus.OK) {
      return true;
    }
    return false;
  }).catch((err: AxiosError) => {
    throw new Error(err.message);
  });
};

export const initializeAntlr = (): Promise<boolean> => {
  if (configData.ANTLR_URI.length === 0) {
    throw new Error('cannot find antlr uri');
  }
  antlrClient = axios.create({
    baseURL: configData.ANTLR_URI,
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
  return pingAntlr().then((res) => {
    return res;
  }).catch((err: Error) => {
    throw new Error(`cannot connect to antlr server: ${err.message}`);
  });
};
