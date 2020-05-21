import { getLogger } from 'log4js';
import { Arguments } from 'yargs';
import { writeCache, cacheData } from '../utils/config';
import { apolloClient } from '../utils/api';
import { Project, ProjectQuery, ProjectQueryVariables, Repository, RepositoryQueryVariables, RepositoryQuery } from '../lib/generated/datamodel';

const logger = getLogger();

interface Args {
  project: string;
  repository: string;
}

export default async (args: Arguments<Args>): Promise<void> => {
  const projectQueryVars: ProjectQueryVariables = {
    name: args.project
  };
  const projectRes = await apolloClient.query<ProjectQuery, ProjectQueryVariables>({
    query: Project,
    variables: projectQueryVars
  });
  cacheData.project = projectRes.data.project._id;
  const repoQueryVars: RepositoryQueryVariables = {
    name: args.repository,
    project: projectRes.data.project._id
  };
  const repositoryRes = await apolloClient.query<RepositoryQuery, RepositoryQueryVariables>({
    query: Repository,
    variables: repoQueryVars
  });
  cacheData.repository = repositoryRes.data.repository._id;
  await writeCache();
  logger.info('saved configuration');
};
