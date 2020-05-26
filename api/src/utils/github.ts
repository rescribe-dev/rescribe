import { graphql as clientUnauthenticated } from '@octokit/graphql';
import { createAppAuth } from '@octokit/auth-app';
import { graphql as client } from '@octokit/graphql/dist-types/types';
import { configData } from './config';

export const createClient = (installationID: number): client => {
  const auth = createAppAuth({
    id: configData.GITHUB_APP_ID,
    privateKey: configData.GITHUB_PRIVATE_KEY,
    installationId: installationID
  });

  return clientUnauthenticated.defaults({
    request: {
      hook: auth.hook
    },
  });
};

export const initializeGithub = (): void => {
  if (configData.GITHUB_PRIVATE_KEY.length === 0) {
    throw new Error('no private key supplied');
  }
  configData.GITHUB_PRIVATE_KEY = configData.GITHUB_PRIVATE_KEY.replace('\\n', '\n');
  if (configData.GITHUB_APP_ID === 0) {
    throw new Error('github app id no supplied');
  }
};
