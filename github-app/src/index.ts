import { Application } from 'probot';
import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';
import jwt from 'jsonwebtoken';
import 'cross-fetch/polyfill';

interface Commit {
  id: string;
  tree_id: string;
  added: string[];
  removed: string[];
  modified: string[];
}

export = (app: Application): void => {
  if (!process.env.API_URL){
    throw new Error('no api url provided');
  }
  if (!process.env.APP_ID) {
    throw new Error('no app id provided');
  }
  const appID = process.env.APP_ID;
  if (!process.env.PRIVATE_KEY) {
    throw new Error('no private key provided');
  }
  const privateKey = process.env.PRIVATE_KEY;
  const api = new ApolloClient({
    uri: `${process.env.API_URL}/graphql`,
  });
  app.on('push', async (context): Promise<void> => {
    if (context.payload.commits.length === 0) {
      app.log.error(new Error(`no commits found for ${context.id}`));
      return;
    }
    const commits = context.payload.commits as Commit[];
    const indexFiles = new Set<string>();
    const addToIndexed = (arr: string[]): void => {
      for (const elem of arr){
        indexFiles.add(elem);
      }
    };
    for (const commit of commits) {
      addToIndexed(commit.added);
      addToIndexed(commit.modified);
      for (const elem of commit.removed){
        indexFiles.delete(elem);
      }
    }
    const octokit = await app.auth();
    const repositoryName = context.payload.repository.name;
    const repositoryID = context.payload.repository.id;
    const repositoryOwner = context.payload.repository.owner.name as string;
    const { data: installation } = await octokit.apps.getRepoInstallation({ 
      owner: repositoryOwner,
      repo: repositoryName
    });
    const ref = context.payload.ref;
    const files = Array.from(indexFiles);
    return new Promise((resolve, _reject) => {
      jwt.sign({
        iss: appID
      }, privateKey, {
        expiresIn: '10m',
        algorithm: 'RS256'
      }, async (err, token) => {
        if (err) {
          app.log.error((err as Error).message);
        } else {
          try {
            const res = await api.mutate({
              mutation: gql`
                mutation indexGithub($githubRepositoryID: Int!, $paths: [String!]!, $ref: String!, $repositoryName: String!, $repositoryOwner: String!, $installationID: Int!) {
                  indexGithub(githubRepositoryID: $githubRepositoryID, paths: $paths, ref: $ref, repositoryName: $repositoryName, repositoryOwner: $repositoryOwner, installationID: $installationID)
                }
              `,
              variables: {
                githubRepositoryID: repositoryID,
                paths: files,
                ref,
                repositoryName,
                repositoryOwner,
                installationID: installation.id,
              },
              context: {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            });
            app.log.info(res.data.indexGithub as string);
            resolve();
          } catch(err) {
            app.log.error((err as Error).message);
          }
        }
      });
    });
  });
};
