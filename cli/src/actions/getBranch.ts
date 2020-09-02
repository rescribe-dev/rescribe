import { getBranch } from '../utils/git';
import { Arguments } from 'yargs';

interface Args {
  path?: string;
}

export const getBranchUtil = async (args: Args): Promise<string> => {
  if (!args.path) {
    args.path = '.';
  }
  return await getBranch(args.path);
};

export default async (args: Arguments<Args>): Promise<void> => {
  const branchName = await getBranchUtil(args);
  console.log(`branch ${branchName}`);
};
