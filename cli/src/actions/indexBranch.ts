import Git, { TreeEntry } from 'nodegit';
import indexFiles from '../utils/indexFiles';
import { Arguments } from 'yargs';
import { cacheData } from '../utils/config';
import { isLoggedIn } from '../utils/authToken';

enum OPEN_FLAG {
  OPEN_NO_SEARCH = 1,
  OPEN_CROSS_FS = 2,
  OPEN_BARE = 4,
  OPEN_NO_DOTGIT = 8,
  OPEN_FROM_ENV = 16
}

interface Args {
  path?: string;
  branch?: string;
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
  const repo = await Git.Repository.openExt(args.path, OPEN_FLAG.OPEN_FROM_ENV, '/');
  const branchName = args.branch ?
    (await repo.getBranch(args.branch)).name()
    : (await repo.getCurrentBranch()).name();
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
        console.log('done indexing files');
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
        reject(new Error(`file ${filePath} is binary`));
        return;
      }
      files.push(file.content());
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
