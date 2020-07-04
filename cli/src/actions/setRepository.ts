import { getLogger } from 'log4js';
import { Arguments } from 'yargs';
import { writeCache, cacheData } from '../utils/config';
import { apolloClient } from '../utils/api';
import { RepositoryNameExists, RepositoryNameExistsQuery, RepositoryNameExistsQueryVariables } from '../lib/generated/datamodel';

const logger = getLogger();

const ownerRepositoryKey = 'owner/repository';

interface Args {
  'owner/repository': string;
}

export default async (args: Arguments<Args>): Promise<void> => {
  if (args[ownerRepositoryKey].length === 0) {
    throw new Error('no repository and/or owner provided');
  }
  const repoOwnerSplit = args[ownerRepositoryKey].split('/');
  let owner: string;
  let repository: string;
  if (repoOwnerSplit.length === 2) {
    owner = repoOwnerSplit[0];
    repository = repoOwnerSplit[1];
  } else {
    owner = cacheData.username;
    repository = args[ownerRepositoryKey];
  }
  const name = repository;
  const repoQueryVars: RepositoryNameExistsQueryVariables = {
    name,
    owner
  };
  const repositoryRes = await apolloClient.query<RepositoryNameExistsQuery, RepositoryNameExistsQueryVariables>({
    query: RepositoryNameExists,
    variables: repoQueryVars
  });
  if (!repositoryRes.data.repositoryNameExists) {
    throw new Error(`repository with name ${repository} does not exist`);
  }
  cacheData.repository = name;
  cacheData.repositoryOwner = owner;
  await writeCache();
  logger.info('saved configuration');
  console.log(`set repository to ${repository}`);
};
