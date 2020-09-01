import Git from 'nodegit';
import parseURL from 'git-url-parse';
import { RepositoryQueryVariables } from '../lib/generated/datamodel';

enum OPEN_FLAG {
  OPEN_NO_SEARCH = 1,
  OPEN_CROSS_FS = 2,
  OPEN_BARE = 4,
  OPEN_NO_DOTGIT = 8,
  OPEN_FROM_ENV = 16
}

export const getGitRepo = async (repositoryPath: string): Promise<Git.Repository> => {
  return await Git.Repository.openExt(repositoryPath, OPEN_FLAG.OPEN_FROM_ENV, '/');
};

export const getBranch = async (repositoryPath: string): Promise<string> => {
  const repo = await getGitRepo(repositoryPath);
  const branch = await repo.getCurrentBranch();
  return branch.name();
};

const defaultRemoteName = 'origin';

export type RepoMetadata = RepositoryQueryVariables;

export const getRepoMetadata = async (repositoryPath: string): Promise<RepoMetadata> => {
  const repo = await getGitRepo(repositoryPath);
  // default remote
  const remoteName = defaultRemoteName;
  let remote: Git.Remote | undefined = undefined;
  for (const currentRemote of await repo.getRemotes()) {
    if (currentRemote.name() === remoteName) {
      remote = currentRemote;
      break;
    }
  }
  if (!remote) {
    throw new Error(`cannot find remote in git repo: ${remoteName}`);
  }
  const remoteURL = parseURL(remote.url());
  if (!remoteURL.name) {
    throw new Error(`cannot find name of repo in remote ${remoteName} URL`);
  }
  if (!remoteURL.owner) {
    throw new Error(`cannot find owner of repo in remote ${remoteName} URL`);
  }
  return {
    name: remoteURL.name,
    owner: remoteURL.owner,
  };
};
