import { Application } from 'probot';
import ApolloClient from 'apollo-boost';
import jwt from 'jsonwebtoken';
import fetch from 'isomorphic-fetch';
import { IndexGithub, IndexGithubMutationVariables, IndexGithubMutation } from './lib/generated/datamodel';
import { initializeConfig, appID, privateKey } from './config';

interface Commit {
  id: string;
  tree_id: string;
  added: string[];
  removed: string[];
  modified: string[];
}

initializeConfig();

export = (app: Application): void => {
  const api = new ApolloClient({
    uri: `${process.env.API_URL}/graphql`,
    fetch,
  });
  app.on('push', async (context): Promise<void> => {
    if (context.payload.commits.length === 0) {
      app.log.error(new Error(`no commits found for ${context.id}`));
      return;
    }
    const commits = context.payload.commits as Commit[];
    const addedSet = new Set<string>();
    const modifiedSet = new Set<string>();
    const removedSet = new Set<string>();
    const addToIndexed = (arr: string[], set: Set<string>): void => {
      for (const elem of arr) {
        set.add(elem);
      }
    };
    for (const commit of commits) {
      addToIndexed(commit.added, addedSet);
      addToIndexed(commit.modified, modifiedSet);
      addToIndexed(commit.removed, removedSet);
    }
    const octokit = await app.auth();
    const repositoryName = context.payload.repository.name;
    const repository = context.payload.repository.id;
    const repositoryOwner = context.payload.repository.owner.name as string;
    const { data: installation } = await octokit.apps.getRepoInstallation({ 
      owner: repositoryOwner,
      repo: repositoryName
    });
    const ref = context.payload.ref;
    const added = Array.from(addedSet);
    const modified = Array.from(modifiedSet);
    const removed = Array.from(removedSet);
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
            const res = await api.mutate<IndexGithubMutation, IndexGithubMutationVariables>({
              mutation: IndexGithub,
              variables: {
                githubRepositoryID: repository,
                added,
                modified,
                removed,
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
            if (!res.data) {
              throw new Error('no data found');
            }
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
