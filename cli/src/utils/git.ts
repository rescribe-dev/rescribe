import Git from 'nodegit';

enum OPEN_FLAG {
  OPEN_NO_SEARCH = 1,
  OPEN_CROSS_FS = 2,
  OPEN_BARE = 4,
  OPEN_NO_DOTGIT = 8,
  OPEN_FROM_ENV = 16
}

export const getBranch = async (repositoryPath: string): Promise<string> => {
  const repo = await Git.Repository.openExt(repositoryPath, OPEN_FLAG.OPEN_FROM_ENV, '/');
  const branch = await repo.getCurrentBranch();
  return branch.name();
};
