import { Application } from 'probot'; // eslint-disable-line no-unused-vars

interface Commit {
  id: string;
  tree_id: string;
  added: string[];
  removed: string[];
  modified: string[];
}

export = (app: Application): void => {
  app.on('push', async (context) => {
    if (context.payload.commits.length === 0) {
      app.log.error(new Error(`no commits found for ${context.id}`))
      return
    }
    const commits = context.payload.commits as Commit[];
    let reindexFiles: string[] = []
    for (const commit of commits) {
      reindexFiles = reindexFiles.concat(commit.added);
      reindexFiles = reindexFiles.concat(commit.modified);
      reindexFiles = reindexFiles.filter(file => !commit.removed.includes(file));
    }
  });
};
