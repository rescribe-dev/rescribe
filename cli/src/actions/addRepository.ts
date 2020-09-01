import { Arguments } from 'yargs';
import { writeCache, cacheData } from '../utils/config';
import { apolloClient } from '../utils/api';
import {
  AddRepository, AddRepositoryMutation,
  AddRepositoryMutationVariables, AccessLevel
} from '../lib/generated/datamodel';
import { getRepoMetadata } from '../utils/git';

interface Args {
  path?: string;
  repository?: string;
};

export const addRepoUtil = async (args: Args): Promise<string> => {
  let repoName: string;
  if (args.repository) {
    repoName = args.repository;
  } else {
    if (!args.path) {
      args.path = '.';
    }
    try {
      const repoData = await getRepoMetadata(args.path);
      repoName = repoData.name;
    } catch (err) {
      const errObj = err as Error;
      throw new Error(`problem getting repo metadata: ${errObj.message}`);
    }
  }
  await apolloClient.mutate<AddRepositoryMutation, AddRepositoryMutationVariables>({
    mutation: AddRepository,
    variables: {
      name: repoName,
      publicAccess: AccessLevel.View
    }
  });
  return repoName;
};

export default async (args: Arguments<Args>): Promise<void> => {
  const repoName = await addRepoUtil(args);
  cacheData.repository = repoName;
  cacheData.repositoryOwner = cacheData.username;
  await writeCache();
  console.log(`added new repository ${repoName}`);
};
