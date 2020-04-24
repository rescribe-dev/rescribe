import { Application } from 'probot';

interface Commit {
  id: string;
  tree_id: string;
  added: string[];
  removed: string[];
  modified: string[];
}

export = (app: Application): void => {
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
    // eslint-disable-next-line no-console
    // console.log(app.auth)
    // const auth = await context.github.oauthAuthorizations.getAuthorization()
    // app.log.info(auth)
  });
};
