import { config } from 'dotenv';
import AWS from 'aws-sdk';

export let dbConnectionURI: string;
export let debug = true;
export let s3Bucket = 'rescribe-sitemap';
export let dbName = 'rescribe';
export let websiteURL = 'https://rescribe.dev';

export const initializeConfig = (requireAWSConfig: boolean): void => {
  config();
  if (!process.env.DB_CONNECTION_URI) {
    throw new Error('cannot find database uri');
  }
  dbConnectionURI = process.env.DB_CONNECTION_URI;
  if (process.env.DB_NAME) {
    dbName = process.env.DB_NAME;
  }
  if (process.env.DEBUG) {
    debug = process.env.DEBUG === 'true';
  }
  if (process.env.WEBSITE_URL) {
    websiteURL = process.env.WEBSITE_URL;
  }
  if (process.env.AWS_S3_BUCKET) {
    s3Bucket = process.env.AWS_S3_BUCKET;
  }
  AWS.config = new AWS.Config();
  if (requireAWSConfig && !process.env.AWS_ACCESS_KEY_ID) {
    throw new Error('no aws access key id provided');
  }
  if (process.env.AWS_ACCESS_KEY_ID) {
    AWS.config.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  }
  if (requireAWSConfig && !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('no aws secret access key provided');
  }
  if (process.env.AWS_SECRET_ACCESS_KEY) {
    AWS.config.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  }
  if (requireAWSConfig && !process.env.AWS_REGION) {
    throw new Error('no aws region provided');
  }
  if (process.env.AWS_REGION) {
    AWS.config.region = process.env.AWS_REGION;
  }
};
