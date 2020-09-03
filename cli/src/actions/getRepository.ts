import { getRepoMetadata } from '../utils/git';
import { Arguments } from 'yargs';
import { cacheData } from '../utils/config';
import { apolloClient } from '../utils/api';
import { Repository, RepositoryQueryVariables, RepositoryQuery, RepositoryBaseDataFragment } from '../lib/generated/datamodel';
import ObjectID from 'bson-objectid';

interface Args {
  path?: string;
};

export const getRepoDataUtil = async (args: Args): Promise<RepositoryBaseDataFragment> => {
  let repoArgs: RepositoryQueryVariables;
  // use path if it was provided, otherwise check cache
  if (!args.path && cacheData.repositoryOwner && cacheData.repository) {
    repoArgs = {
      name: cacheData.repository,
      owner: cacheData.repositoryOwner,
    };
  } else {
    if (!args.path) {
      args.path = '.';
    }
    repoArgs = await getRepoMetadata(args.path);
  }
  const repositoryRes = await apolloClient.query<RepositoryQuery, RepositoryQueryVariables>({
    query: Repository,
    variables: repoArgs,
  });
  return repositoryRes.data.repository;
};

export default async (args: Arguments<Args>): Promise<void> => {
  const repoData = await getRepoDataUtil(args);
  console.log(`got repository "${repoData.name}" with id ${new ObjectID(repoData._id).toHexString()}`);
};
