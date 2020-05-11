import { getBranch } from '../utils/git';
import { logger } from '../utils/logger';
import { Arguments } from 'yargs';

interface Args {
  path?: string;
}

export default async (args: Arguments<Args>): Promise<void> => {
  if (!args.path) {
    args.path = '.';
  }
  const branchName = await getBranch(args.path);
  logger.info(`got branch  "${branchName}"`);
  console.log(`branch ${branchName}`);
};
