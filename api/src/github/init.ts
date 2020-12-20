import { graphql as graphqlClient } from '@octokit/graphql';
import { request as restClient } from '@octokit/request';
import { RequestInterface as restClientType } from '@octokit/types';
import { createAppAuth } from '@octokit/auth-app';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';
import { graphql as graphqlClientType } from '@octokit/graphql/dist-types/types';
import { configData } from '../utils/config';
import { AuthInterface } from '@octokit/types';
import { AuthOptions as AppAuthOptions, Authentication as AppAuthentication } from '@octokit/auth-app/dist-types/types';
import {
  AuthOptions as OAuthAuthOptions,
  Authentication as OauthAuthentication,
  TokenAuthentication as OauthTokenAuthentication
} from '@octokit/auth-oauth-app/dist-types/types';

export let githubOauthClient: ((authOptions: OAuthAuthOptions) => Promise<OauthAuthentication>);

export let githubAppClient: AuthInterface<[AppAuthOptions], AppAuthentication>;

export const createGithubAppClient = async (installationID: number): Promise<graphqlClientType> => {
  const authData = (await githubAppClient({
    installationId: installationID,
    type: 'installation'
  }));
  return graphqlClient.defaults({
    headers: {
      authorization: `Bearer ${authData.token}`,
    },
  });
};

export const createGithubAppClientREST = async (installationID: number): Promise<restClientType> => {
  const authData = (await githubAppClient({
    installationId: installationID,
    type: 'installation'
  }));
  return restClient.defaults({
    headers: {
      authorization: `Bearer ${authData.token}`,
    },
  });
};

export const createGithubOauthClient = async (code: string, state: string): Promise<graphqlClientType> => {
  const authData = (await githubOauthClient({
    code,
    state,
    type: 'token',
  })) as OauthTokenAuthentication;
  return graphqlClient.defaults({
    headers: {
      authorization: `Bearer ${authData.token}`,
    },
  });
};

export const createGithubOauthClientREST = async (code: string, state: string): Promise<restClientType> => {
  const authData = (await githubOauthClient({
    code,
    state,
    type: 'token',
  })) as OauthTokenAuthentication;
  return restClient.defaults({
    headers: {
      authorization: `token ${authData.token}`,
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
  if (configData.GITHUB_CLIENT_ID.length === 0) {
    throw new Error('no github client id supplied');
  }
  if (configData.GITHUB_CLIENT_SECRET.length === 0) {
    throw new Error('github client secret not supplied');
  }
  githubAppClient = createAppAuth({
    appId: configData.GITHUB_APP_ID,
    privateKey: configData.GITHUB_PRIVATE_KEY,
  });
  githubOauthClient = createOAuthAppAuth({
    clientId: configData.GITHUB_CLIENT_ID,
    clientSecret: configData.GITHUB_CLIENT_SECRET,
  });
};
