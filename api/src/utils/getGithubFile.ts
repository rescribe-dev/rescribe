import { gql } from 'apollo-server-express';
import { print } from 'graphql/language/printer';
import { graphql, GraphQlQueryResponseData } from '@octokit/graphql/dist-types/types';

interface GithubFileRes {
  repository: {
    isBinary: boolean;
    text: string;
  }
}

export const getGithubFile = async (githubClient: graphql, ref: string, path: string, repositoryName: string, repositoryOwner: string): Promise<string> => {
  const expression = `${ref}:${path}`;
  const res: GraphQlQueryResponseData = await githubClient(print(gql`
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
  if (!res) {
    throw new Error(`no response found for file query ${expression}`);
  }
  const fileData = res as GithubFileRes;
  if (fileData.repository.isBinary) {
    throw new Error(`file ${expression} is binary`);
  }
  return fileData.repository.text;
};
