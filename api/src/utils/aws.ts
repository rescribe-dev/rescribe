import AWS from 'aws-sdk';
import { configData } from './config';
import { ObjectId } from 'mongodb';
import { isProduction } from './mode';
import { getLogger } from 'log4js';

const logger = getLogger();

export const s3Client = new AWS.S3();

export let fileBucket: string;

export const getFileKey = (repository: ObjectId, branch: string, path: string): string => {
  return `${repository.toHexString()}/${branch}/${path}`;
};

export const getS3FileData = async (repository: ObjectId, branch: string, path: string): Promise<string> => {
  const key = getFileKey(repository, branch, path);
  const s3File = await s3Client.getObject({
    Bucket: fileBucket,
    Key: key,
  }).promise();
  if (!s3File.Body) {
    throw new Error(`no body for file ${key}`);
  }
  return s3File.Body.toString();
};

export const initializeAWS = async (): Promise<void> => {
  if (configData.AWS_S3_BUCKET_FILES.length === 0) {
    throw new Error('s3 bucket not provided');
  }
  fileBucket = configData.AWS_S3_BUCKET_FILES;
  AWS.config = new AWS.Config();
  if (configData.AWS_ACCESS_KEY_ID.length === 0 && !isProduction()) {
    throw new Error('no aws access key id provided');
  } else if (configData.AWS_ACCESS_KEY_ID.length > 0) {
    AWS.config.accessKeyId = configData.AWS_ACCESS_KEY_ID;
  }
  if (configData.AWS_SECRET_ACCESS_KEY.length === 0 && !isProduction()) {
    throw new Error('no aws secret access key provided');
  } else if (configData.AWS_SECRET_ACCESS_KEY.length > 0) {
    AWS.config.secretAccessKey = configData.AWS_SECRET_ACCESS_KEY;
  }
  if (configData.AWS_REGION.length === 0) {
    throw new Error('no aws region provided');
  }
  AWS.config.region = configData.AWS_REGION;
  const locationConstraint = (await s3Client.getBucketLocation({
    Bucket: fileBucket
  }).promise()).LocationConstraint;
  const locationConstraintString = locationConstraint && locationConstraint.length > 0
    ? locationConstraint as string : 'none';
  logger.info(`s3 bucket ${fileBucket} location constraint: ${locationConstraintString}`);
};
