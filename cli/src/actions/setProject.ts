import { getLogger } from 'log4js';
import { Arguments } from 'yargs';
import { writeCache, cacheData } from '../utils/config';

const logger = getLogger();

interface Args {
  project: string;
  repository: string;
}

export default async (args: Arguments<Args>): Promise<void> => {
  cacheData.project = args.project;
  cacheData.repository = args.repository;
  await writeCache();
  logger.info('saved configuration');
};
