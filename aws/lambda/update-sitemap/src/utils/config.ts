import { initializeGlobalConfig } from '../shared/global-config';

export let s3Bucket = 'rescribe-sitemap';

export const initializeConfig = async (requireAWSConfig: boolean): Promise<void> => {
  await initializeGlobalConfig(requireAWSConfig, true);
  if (process.env.AWS_S3_BUCKET) {
    s3Bucket = process.env.AWS_S3_BUCKET;
  }
};
