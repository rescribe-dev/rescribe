import { graphql as clientUnauthenticated } from '@octokit/graphql';
import { createAppAuth } from '@octokit/auth-app';
import { graphql as client } from "@octokit/graphql/dist-types/types";

let appID: number;
let privateKey: string;

export const createClient = (installationID: number): client => {
  const auth = createAppAuth({
    id: appID,
    privateKey,
    installationId: installationID
  });

  return clientUnauthenticated.defaults({
    request: {
      hook: auth.hook
    },
  });
};

export const initializeGithub = async (): Promise<void> => {
  if (!process.env.GITHUB_PRIVATE_KEY) {
    throw new Error('no private key supplied');
  }
  privateKey = process.env.GITHUB_PRIVATE_KEY;
  if (!process.env.GITHUB_APP_ID) {
    throw new Error('github app id no supplied');
  }
  appID = Number(process.env.GITHUB_APP_ID);
  if (!appID) {
    throw new Error('invalid github app id supplied');
  }
};
