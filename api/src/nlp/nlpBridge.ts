import axios, { AxiosInstance, AxiosError } from 'axios';
import HttpStatus from 'http-status-codes';
import { configData } from '../utils/config';
import { getLogger } from 'log4js';
import sleep from '../shared/sleep';

const logger = getLogger();

let nlpClient: AxiosInstance;

interface NLPProcessOutput {
  matches: string[];
}

interface NLPProcessInput {
  query: string
}

const pingRetryAfter = 5;

export const processInput = async(query: string): Promise<NLPProcessOutput> => {
  const input: NLPProcessInput = {
    query
  };
  const processOutput = await nlpClient.put<NLPProcessOutput>('/processInput', input);
  if (!processOutput.data) {
    throw new Error('cannot find process input data');
  }
  return processOutput.data;
};

export const pingNLP = async (): Promise<boolean> => {
  try {
    const res = await nlpClient.get('/ping');
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
  nlpClient = axios.create({
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
  for (;;) {
    try {
      const res = await pingNLP();
      return res;
    }
    catch (err) {
      logger.error(new Error(`cannot connect to nlp server: ${err.message}`));
      // retry ping
      await sleep(pingRetryAfter * 1000);
    }
  }
};
