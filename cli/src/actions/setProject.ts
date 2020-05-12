import { getLogger } from 'log4js';
import { Arguments } from 'yargs';
import { writeCache, cacheData } from '../utils/config';
import { apolloClient } from '../utils/api';
import gql from 'graphql-tag';

const logger = getLogger();

interface Args {
  project: string;
  repository: string;
}

interface ResProject {
  project: {
    _id: string;
  }
}

interface ResRepository {
  repository: {
    _id: string;
  }
}

export default async (args: Arguments<Args>): Promise<void> => {
  const projectRes = await apolloClient.query<ResProject>({
    query: gql`
      query project($name: String!) {
        project(name: $name) {
          _id
        }
      }
    `,
    variables: {
      name: args.project
    }
  });
  cacheData.project = projectRes.data.project._id;
  const repositoryRes = await apolloClient.query<ResRepository>({
    query: gql`
      query repository($repository: String!, $project: ObjectId!) {
        repository(repository: $repository, project: $project) {
          _id
        }
      }
    `,
    variables: {
      repository: args.repository,
      project: projectRes.data.project._id
    }
  });
  cacheData.repository = repositoryRes.data.repository._id;
  await writeCache();
  logger.info('saved configuration');
};
