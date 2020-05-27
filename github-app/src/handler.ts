import { serverless } from '@probot/serverless-lambda';
import appFn from './';

module.exports.github = serverless(appFn);
