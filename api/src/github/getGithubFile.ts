import { gql } from 'apollo-server-express';
import { print } from 'graphql/language/printer';
import { graphql } from '@octokit/graphql/dist-types/types';

interface ResponseData {
  isBinary: boolean;
  text: string;
}

interface GithubFileRes {
  repository: ResponseData
}

export const getGithubFile = async (githubClient: graphql, ref: string, path: string, repositoryName: string, repositoryOwner: string): Promise<ResponseData> => {
  const expression = `${ref}:${path}`;
  const res = await githubClient<GithubFileRes>(print(gql`
    query files($name: String!, $owner: String!, $expression: String!) { 
      repository(name: $name, owner: $owner) { 
        object(expression: $expression) {
          ...on Blob {
            isBinary
            text
          }
        }
      }
    }
  `), {
    expression,
    name: repositoryName,
    owner: repositoryOwner
  });
  return res.repository;
};
