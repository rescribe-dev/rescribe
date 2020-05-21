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

export const initializeGithub = async (): Promise<void> => {
  if (configData.GITHUB_PRIVATE_KEY.length === 0) {
    throw new Error('no private key supplied');
  }
  if (configData.GITHUB_APP_ID === 0) {
    throw new Error('github app id no supplied');
  }
};
