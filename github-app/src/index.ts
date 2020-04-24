import { Application } from 'probot';
import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';
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
  const api = new ApolloClient({
    uri: `${process.env.API_URL}/graphql`,
  });
  app.on('push', async (context): Promise<void> => {
    if (context.payload.commits.length === 0) {
      app.log.error(new Error(`no commits found for ${context.id}`))
      return
    }
    const commits = context.payload.commits as Commit[];
    const indexFiles = new Set<string>();
    const addToIndexed = (arr: string[]): void => {
      for (const elem of arr){
        indexFiles.add(elem);
      }
    }
    for (const commit of commits) {
      addToIndexed(commit.added);
      addToIndexed(commit.modified);
      for (const elem of commit.removed){
        indexFiles.delete(elem);
      }
    }
    const octokit = await app.auth()
    const repositoryName = context.payload.repository.name
    const repositoryOwner = context.payload.repository.owner.name as string
    const { data: installation } = await octokit.apps.getRepoInstallation({ 
      owner: repositoryOwner,
      repo: repositoryName
    })
    const ref = context.payload.ref
    const files = Array.from(indexFiles);
    try {
      const res = await api.mutate({
        mutation: gql`
          mutation indexGithub($files: [String!]!, $ref: String!, $repositoryName: String!, $repositoryOwner: String!, $installationID: Int!) {
            indexGithub(files: $files, ref: $ref, repositoryName: $repositoryName, repositoryOwner: $repositoryOwner, installationID: $installationID)
          }
        `,
        variables: {
          files,
          ref,
          repositoryName,
          repositoryOwner,
          installationID: installation.id,
        }
      });
      app.log.info(res.data.indexGithub as string);
    } catch(err) {
      app.log.error((err as Error).message);
    }
  });
};
