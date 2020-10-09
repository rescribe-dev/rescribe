import axios, { AxiosInstance, AxiosError } from 'axios';
import statusCodes from 'http-status-codes';
import { configData } from '../utils/config';
import { getLogger } from 'log4js';
import sleep from '../shared/sleep';
import { contentTypeHeader } from '../utils/misc';
import { components } from '../generated/nlp';

const logger = getLogger();

let nlpClient: AxiosInstance;

const defaultLimitPredict = 5;

interface NLPPredictLanguageOutput {
  data: components['schemas']['Prediction'][];
};

interface NLPPredictLanguageInput {
  query: string,
  limit?: number;
};

const pingRetryAfter = 5;

export const predictLanguage = async(input: NLPPredictLanguageInput): Promise<NLPPredictLanguageOutput> => {
  if (!input.limit) {
    input.limit = defaultLimitPredict;
  }
  const processOutput = await nlpClient.put<NLPPredictLanguageOutput>('/predictLanguage', input);
  if (!processOutput.data) {
    throw new Error('cannot find predict language data');
  }
  return processOutput.data;
};

export const pingNLP = async (): Promise<boolean> => {
  try {
    const res = await nlpClient.get('/ping');
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
        [contentTypeHeader]: 'application/json',
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
