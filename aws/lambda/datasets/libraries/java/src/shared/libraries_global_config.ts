export let baseFolder = 'libraries';
export let s3Bucket = 'rescribe-datasets';
export let saveLocal = false;
export let useQueue = true;
export let queueURL: string;
export let paginationSize = 100;

export const initializeLibrariesConfig = (): void => {
  if (process.env.BASE_FOLDER) {
    baseFolder = process.env.BASE_FOLDER;
  }
  if (process.env.AWS_S3_BUCKET) {
    s3Bucket = process.env.AWS_S3_BUCKET;
  }
  if (process.env.SAVE_LOCAL) {
    saveLocal = process.env.SAVE_LOCAL === 'true';
  }
  if (process.env.USE_QUEUE) {
    useQueue = process.env.USE_QUEUE === 'true';
  }
  if (useQueue) {
    if (!process.env.QUEUE_URL) {
      throw new Error('cannot find queue url when use queue is true');
    }
    queueURL = process.env.QUEUE_URL;
  }
  if (process.env.PAGINATION_SIZE) {
    const paginationCast = Number(process.env.PAGINATION_SIZE);
    if (!paginationCast) {
      throw new Error(`pagination ${process.env.PAGINATION_SIZE} is not numeric`);
    }
    paginationSize = paginationCast as number;
  }
};
