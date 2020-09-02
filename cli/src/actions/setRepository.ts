import { getLogger } from 'log4js';
import { Arguments } from 'yargs';
import { writeCache, cacheData } from '../utils/config';
import { apolloClient } from '../utils/api';
import {
  RepositoryNameExists,
  RepositoryNameExistsQuery,
  RepositoryNameExistsQueryVariables,
  Repositories,
  RepositoriesQuery,
  RepositoriesQueryVariables,
  PublicUserQuery,
  PublicUser,
  PublicUserQueryVariables
} from '../lib/generated/datamodel';
import prompts from 'prompts';
import yesNoPrompt from '../utils/boolPrompt';
import { addRepoUtil } from './addRepository';
import { isLoggedIn } from '../utils/authToken';
import ObjectId from 'bson-objectid';

const logger = getLogger();

const ownerRepositoryKey = 'owner/repository';

interface Args {
  'owner/repository'?: string;
}

const promptRepoPerPage = 10;

const enum PaginationSelectType { Previous, Next, Selection };

interface RepoSelectData {
  name: string;
  owner: ObjectId | string;
};

interface RepoSelectVal {
  type: PaginationSelectType;
  data?: RepoSelectData;
}

interface RepoSelect {
  title: string;
  value: RepoSelectVal;
};

const promptNoReposFound = async (): Promise<RepositoryNameExistsQueryVariables | null> => {
  console.log('No repositories found.\n');
  const res = await yesNoPrompt('would you like to create a new repo? (y/n)');
  if (!res) {
    return null;
  }
  const repoPromptRes = await prompts({
    type: 'text',
    name: 'repoName',
    message: 'name'
  });
  const repoName = repoPromptRes.repoName as string;
  await addRepoUtil({
    repository: repoName
  });
  return {
    name: repoName,
    owner: cacheData.username,
  };
};

const promptRepository = async (): Promise<RepositoryNameExistsQueryVariables | null> => {
  let currentPage = 0;
  // TODO: add pagination hasNextPage from the query
  const hasNextPage = false;
  for (; ;) {
    const repositoryRes = await apolloClient.query<RepositoriesQuery, RepositoriesQueryVariables>({
      query: Repositories,
      variables: {
        page: currentPage,
        perpage: promptRepoPerPage,
      }
    });
    const repositoriesData = repositoryRes.data.repositories;
    if (repositoriesData.length === 0) {
      return await promptNoReposFound();
    }
    const repositories: RepoSelect[] = [];
    for (const repo of repositoriesData) {
      repositories.push({
        title: repo.name,
        value: {
          type: PaginationSelectType.Selection,
          data: {
            name: repo.name,
            owner: repo.owner,
          },
        }
      });
    }
    if (hasNextPage) {
      repositories.push({
        title: 'next',
        value: {
          type: PaginationSelectType.Next,
        }
      });
    }
    if (currentPage > 0) {
      repositories.push({
        title: 'previous',
        value: {
          type: PaginationSelectType.Previous,
        }
      });
    }

    const promptSelection = await prompts({
      type: 'select',
      name: 'repository',
      message: 'Choose the repository to activate',
      choices: repositories
    });
    const promptSelectionVal = promptSelection.repository as RepoSelectVal;
    if (promptSelectionVal.data) {
      const ownerRes = await apolloClient.query<PublicUserQuery, PublicUserQueryVariables>({
        query: PublicUser,
        variables: {
          id: promptSelectionVal.data.owner
        }
      });
      return {
        name: promptSelectionVal.data.name,
        owner: ownerRes.data.publicUser.username
      };
    }
    if (promptSelectionVal.type === PaginationSelectType.Previous) {
      currentPage--;
    } else if (promptSelectionVal.type === PaginationSelectType.Next) {
      currentPage++;
    }
  }
};

export const setRepoUtil = async (args: Args): Promise<RepositoryNameExistsQueryVariables | null> => {
  let repoQueryVars: RepositoryNameExistsQueryVariables | undefined = undefined;
  const ownerRepo = args[ownerRepositoryKey];
  if (ownerRepo) {
    const repoOwnerSplit = ownerRepo.split('/');
    if (repoOwnerSplit.length === 2) {
      repoQueryVars = {
        owner: repoOwnerSplit[0],
        name: repoOwnerSplit[1],
      };
    } else {
      repoQueryVars = {
        owner: cacheData.username,
        name: ownerRepo,
      };
    }
  } else {
    if (!isLoggedIn(cacheData.authToken)) {
      throw new Error('user must be logged in to select a repository');
    }
    const repoPromptData = await promptRepository();
    if (!repoPromptData) {
      return null;
    }
    repoQueryVars = repoPromptData;
  }
  const repositoryRes = await apolloClient.query<RepositoryNameExistsQuery, RepositoryNameExistsQueryVariables>({
    query: RepositoryNameExists,
    variables: repoQueryVars
  });
  if (!repositoryRes.data.repositoryNameExists) {
    throw new Error(`repository with name ${repoQueryVars.name} does not exist`);
  }
  cacheData.repository = repoQueryVars.name;
  cacheData.repositoryOwner = repoQueryVars.owner ?
    repoQueryVars.owner : cacheData.username;
  await writeCache();
  return repoQueryVars;
};

export default async (args: Arguments<Args>): Promise<void> => {
  const repoQueryVars = await setRepoUtil(args);
  if (!repoQueryVars) {
    return;
  }
  logger.info('saved configuration');
  console.log(`set repository to ${repoQueryVars.name}`);
};
