import { config } from 'dotenv';
import AWS from 'aws-sdk';

export let debug = true;
export let s3Bucket = 'rescribe-datasets';
export const baseFolder = 'libraries';

export const initializeConfig = async (requireAWSConfig: boolean): Promise<void> => {
  config();
  if (process.env.DEBUG) {
    debug = process.env.DEBUG === 'true';
  }
  if (process.env.AWS_S3_BUCKET) {
    s3Bucket = process.env.AWS_S3_BUCKET;
  }
  AWS.config = new AWS.Config();
  if (requireAWSConfig && !process.env.AWS_ACCESS_KEY_ID) {
    throw new Error('no aws access key id provided');
  }
  if (requireAWSConfig && !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('no aws secret access key provided');
  }
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    AWS.config.credentials = new AWS.Credentials({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
  }
  if (requireAWSConfig && !process.env.AWS_REGION) {
    throw new Error('no aws region provided');
  }
  if (process.env.AWS_REGION) {
    AWS.config.region = process.env.AWS_REGION;
  }
};
