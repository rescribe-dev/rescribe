export let baseFolder = 'libraries';
export let s3Bucket = 'rescribe-datasets';

export const initializeLibrariesConfig = (): void => {
  if (process.env.BASE_FOLDER) {
    baseFolder = process.env.BASE_FOLDER;
  }
  if (process.env.AWS_S3_BUCKET) {
    s3Bucket = process.env.AWS_S3_BUCKET;
  }
};
