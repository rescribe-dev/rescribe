import { getLogger } from 'log4js';
import { Arguments } from 'yargs';
import { writeCache, cacheData } from '../utils/config';
import { apolloClient } from '../utils/api';
import { RepositoryNameExists, RepositoryNameExistsQuery, RepositoryNameExistsQueryVariables } from '../lib/generated/datamodel';

const logger = getLogger();

interface Args {
  repositoryOwner: string;
}

export default async (args: Arguments<Args>): Promise<void> => {
  if (args.repositoryOwner.length === 0) {
    throw new Error('no repository and/or owner provided');
  }
  const repoOwnerSplit = args.repositoryOwner.split('/');
  let owner: string;
  let repository: string;
  if (repoOwnerSplit.length === 2) {
    owner = repoOwnerSplit[0];
    repository = repoOwnerSplit[1];
  } else {
    owner = cacheData.username;
    repository = args.repositoryOwner;
  }
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
  await writeCache();
  logger.info('saved configuration');
  console.log(`set repository to ${repository}`);
};
