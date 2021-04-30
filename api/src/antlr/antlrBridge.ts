import axios, { AxiosInstance, AxiosError } from 'axios';
import statusCodes from 'http-status-codes';
import { ProcessFileInput } from './antlrTypes';
import AntlrFile from '../schema/antlr/file';
import { configData } from '../utils/config';
import { contentTypeHeader } from '../utils/misc';

let antlrClient: AxiosInstance;

export const processFile = async (inputData: ProcessFileInput): Promise<AntlrFile> => {
  try {
    if (!antlrClient) {
      throw new Error('antlr client not initialized');
    }
    const res = await antlrClient.post<AntlrFile>('/processFile', inputData);
    if (res.status === statusCodes.OK) {
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

export const pingAntlr = async (): Promise<boolean> => {
  try {
    const res = await antlrClient.get('/ping');
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

export const initializeAntlr = async (): Promise<boolean> => {
  if (configData.ANTLR_URI.length === 0) {
    throw new Error('cannot find antlr uri');
  }
  antlrClient = axios.create({
    baseURL: configData.ANTLR_URI,
    headers: {
      common: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        [contentTypeHeader]: 'application/json',
        Pragma: 'no-cache',
      },
    },
    timeout: 3000,
  });
  // try {
  //   const res = await pingAntlr();
  //   return res;
  // }
  // catch (err) {
  //   throw new Error(`cannot connect to antlr server: ${err.message}`);
  // }
  return true;
};
