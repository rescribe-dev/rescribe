import { gql } from 'apollo-server-express';
import { getLogger } from 'log4js';
import { print } from 'graphql/language/printer';
import { graphql } from '@octokit/graphql/dist-types/types';

const logger = getLogger();

interface GithubFileRes {
  isBinary: boolean;
  text: string;
}

export const getGithubFile = async (githubClient: graphql, ref: string, path: string, repositoryName: string, repositoryOwner: string): Promise<string> => {
  const expression = `${ref}:${path}`;
  const res = await githubClient(print(gql`
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
  const fileData = res.repository.object as GithubFileRes;
  if (fileData.isBinary) {
    throw new Error(`file ${expression} is binary`);
  }
  logger.info(`got text for ${expression}`);
  return fileData.text;
};