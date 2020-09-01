import { Arguments } from 'yargs';
import { cacheData } from '../utils/config';
import { isLoggedIn } from '../utils/authToken';
import { getGitRepo } from '../utils/git';
import { indexBranchUtil } from './indexBranch';

interface Args {
  path?: string;
  branches?: string;
}

export default async (args: Arguments<Args>): Promise<void> => {
  if (cacheData.repositoryOwner.length === 0 || cacheData.repository.length === 0) {
    throw new Error('owner and repository need to be set with <set-repository>');
  }
  if (!isLoggedIn(cacheData.authToken)) {
    throw new Error('user must be logged in to index a branch');
  }
  if (!args.path) {
    args.path = '.';
  }
  const repo = await getGitRepo(args.path);
  let branches: string[] | undefined = undefined;
  if (args.branches) {
    branches = args.branches.trim().split(',');
  } else {
    branches = (await repo.getReferences()).map(reference => reference.name());
  }
  for (const branch of branches) {
    await indexBranchUtil(repo, branch);
  }
  console.log('done indexing branches');
};
