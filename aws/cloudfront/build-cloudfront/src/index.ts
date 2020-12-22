import { createReadStream, statSync, readdirSync } from 'fs';
import { extname, resolve } from 'path';
import AWS from 'aws-sdk';
import { createBrotliCompress, createGzip } from 'zlib';
import mime from 'mime-types';
import { config } from 'dotenv';
import { deleteObjects } from './shared/s3utils';

const defaultBase = 'none';
const gzipBase = 'gzip';
const brotliBase = 'brotli';

const s3Client = new AWS.S3();
const cloudfrontClient = new AWS.CloudFront();

let s3Bucket: string;
let sourceDir: string;
let cloudfrontID: string;

const processFile = async (filePath: string): Promise<void> => {
  const mimeFileType = mime.lookup(extname(filePath));
  const fileType = mimeFileType ? mimeFileType : 'application/octet-stream';
  const bucketPath = filePath.split(sourceDir)[1];
  const defaultFile = createReadStream(filePath);
  await s3Client.upload({
    Bucket: s3Bucket,
    Body: defaultFile,
    Key: defaultBase + bucketPath,
    ContentEncoding: 'identity',
    ContentType: fileType
  })
    .on('httpUploadProgress', (evt) => {
      console.log(evt);
    })
    .promise();
  const readGzip = createReadStream(filePath);
  const gzipFile = readGzip.pipe(createGzip());
  await s3Client.upload({
    Bucket: s3Bucket,
    Body: gzipFile,
    Key: gzipBase + bucketPath,
    ContentEncoding: 'gzip',
    ContentType: fileType
  })
    .on('httpUploadProgress', (evt) => {
      console.log(evt);
    })
    .promise();
  const readBrotli = createReadStream(filePath);
  const brotliFile = readBrotli.pipe(createBrotliCompress());
  await s3Client.upload({
    Bucket: s3Bucket,
    Body: brotliFile,
    Key: brotliBase + bucketPath,
    ContentEncoding: 'br',
    ContentType: fileType
  })
    .on('httpUploadProgress', (evt) => {
      console.log(evt);
    })
    .promise();
};

const processDirectory = async (dir: string): Promise<void> => {
  const list = readdirSync(dir);
  for (const filePath of list) {
    const file = resolve(dir, filePath);
    const stats = statSync(file);
    if (stats.isDirectory()) {
      await processDirectory(file);
    } else {
      await processFile(file);
    }
  }
};

const clearCloudfront = async (): Promise<void> => {
  await cloudfrontClient.createInvalidation({
    DistributionId: cloudfrontID,
    InvalidationBatch: {
      CallerReference: new Date().getTime().toString(),
      Paths: {
        Quantity: 1,
        Items: [
          '/*'
        ]
      }
    }
  }).promise();
};

const runAction = async (): Promise<void> => {
  config();
  if (!process.env.AWS_CLOUDFRONT_ID) {
    throw new Error('cloudfront id not provided');
  }
  cloudfrontID = process.env.AWS_CLOUDFRONT_ID;
  if (!process.env.AWS_S3_BUCKET) {
    throw new Error('s3 bucket not provided');
  }
  s3Bucket = process.env.AWS_S3_BUCKET;
  if (!process.env.SOURCE_DIR) {
    throw new Error('no source directory provided');
  }
  sourceDir = process.env.SOURCE_DIR;
  AWS.config = new AWS.Config();
  if (!process.env.AWS_ACCESS_KEY_ID) {
    throw new Error('no aws access key id provided');
  }
  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('no aws secret access key provided');
  }
  AWS.config.credentials = new AWS.Credentials({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });
  if (!process.env.AWS_REGION) {
    throw new Error('no aws region provided');
  }
  AWS.config.region = process.env.AWS_REGION;
  await deleteObjects(s3Client, s3Bucket, '/');
  await processDirectory(sourceDir);
  await clearCloudfront();
};

if (require.main === module) {
  runAction().then(() => {
    console.log('done with deploy');
  }).catch((err: Error) => {
    console.error(err.message);
    process.exit(1);
  });
}

export default runAction;
