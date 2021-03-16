import Git, { TreeEntry } from 'nodegit';
import indexFiles from '../utils/indexFiles';
// import validateRepo from '../utils/validateRepo';
import { Arguments } from 'yargs';
import { cacheData } from '../utils/config';
import { isLoggedIn } from '../utils/authToken';
import { getGitRepo } from '../utils/git';

interface Args {
  path?: string;
  branch?: string;
}

export const indexBranchUtil = async (repo: Git.Repository, branchName: string): Promise<void> => {
  const commit = await repo.getBranchCommit(branchName);
  const tree = await commit.getTree();
  const walker = tree.walk();
  return new Promise(async (resolve, reject) => {
    const files: Buffer[] = [];
    const paths: string[] = [];
    let finished = false;
    const callback = async (): Promise<void> => {
      try {
        await indexFiles(paths, files, branchName);
        resolve();
      } catch (err) {
        reject(err as Error);
      }
    };
    walker.on('entry', async (entry: TreeEntry) => {
      const filePath = entry.path();
      paths.push(`/${filePath}`);
      const file = await entry.getBlob();
      if (file.isBinary()) {
        console.warn(`file ${filePath} is binary`);
        files.push(file.rawcontent().toBuffer(file.rawsize()));
      } else {
        files.push(file.content());
      }

      if (finished && paths.length === files.length) {
        await callback();
      }
    });
    walker.on('error', (err: Error) => {
      throw err;
    });
    walker.on('end', () => {
      finished = true;
    });
    walker.start();
  });
};

export default async (args: Arguments<Args>): Promise<void> => {
  if (cacheData.repositoryOwner.length === 0 || cacheData.repository.length === 0) {
    throw new Error('owner and repository need to be set with <set-repo>');
  }
  if (!isLoggedIn(cacheData.authToken)) {
    throw new Error('user must be logged in to index a branch');
  }
  if (!args.path) {
    args.path = '.';
  }
  const repo = await getGitRepo(args.path);
  // await validateRepo(repo);
  const branchName = args.branch ?
    (await repo.getBranch(args.branch)).name()
    : (await repo.getCurrentBranch()).name();
  await indexBranchUtil(repo, branchName);
  console.log('done indexing the branch');
};
