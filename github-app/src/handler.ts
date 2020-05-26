import  { serverless } from '@probot/serverless-lambda';
import appFn from './';

export default serverless(appFn);
