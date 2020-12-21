import { EventBridgeHandler } from 'aws-lambda';
import AWS from 'aws-sdk';
import { getLogger } from 'log4js';
import { dataFolder, initializeConfig, repositoryURL } from './utils/config';
import { initializeLogger } from './utils/logger';
import axios from 'axios';
import statusCodes from 'http-status-codes';
import { baseFolder, s3Bucket } from './shared/libraries_global_config';

const logger = getLogger();

const s3Client = new AWS.S3();

const writeDataS3 = async (basename: string, content: string): Promise<void> => {
  const fileType = 'application/x-yaml';
  await s3Client.upload({
    Bucket: s3Bucket,
    Body: content,
    Key: `${baseFolder}/${dataFolder}/${basename}`,
    ContentEncoding: 'identity',
    ContentType: fileType
  })
    .on('httpUploadProgress', (evt) => {
      logger.info(evt);
    })
    .promise();
};

const getData = async (currentPath: string): Promise<void> => {
  const res = await axios.get(`${repositoryURL}/${currentPath}`);
  if (res.status !== statusCodes.OK) {
    throw new Error('problem with getting data');
  }
};

const writeDatasetRecursive = async (): Promise<void> => {
  await getData('/');
  await writeDataS3('', '');
  logger.info('done with getting datasets');
};

export const handler: EventBridgeHandler<string, null, void> = async (_event, _context, callback): Promise<void> => {
  await initializeConfig(false);
  initializeLogger();
  await writeDatasetRecursive();
  callback();
  process.exit(0);
};

const getDataset = async (): Promise<void> => {
  await initializeConfig(true);
  initializeLogger();
  await writeDatasetRecursive();
};

if (require.main === module) {
  getDataset().then(() => {
    logger.info('done with update');
    process.exit(0);
  }).catch((err: Error) => {
    console.error(err.message);
    process.exit(1);
  });
}

export default getDataset;
