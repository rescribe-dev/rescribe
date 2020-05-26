import  { serverless } from '@probot/serverless-lambda';
import appFn from './';

export const probot = serverless(appFn);
