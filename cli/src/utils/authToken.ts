import jwt from 'jsonwebtoken';
import { configData, cacheData, writeCache } from './config';
import { apolloClient } from './api';
import { UserQuery, UserQueryVariables, User } from '../lib/generated/datamodel';

export const isLoggedIn = (authToken: string): boolean => {
  let res = true;
  try {
    const keys = jwt.decode(authToken);
    if (keys === null || typeof keys === 'string') {
      return false;
    }
    const exp: number = keys['exp'];
    if (!exp) {
      return false;
    }
    if (Date.now() >= exp * 1000) {
      res = false;
    }
  } catch (err) {
    res = false;
  }
  return res;
};

export const setAuthToken = async (token: string): Promise<void> => {
  configData.authToken = token;
  cacheData.authToken = token;
  await writeCache();
};

export const setUsername = async(username?: string): Promise<void> => {
  if (username === undefined) {
    const userRes = await apolloClient.query<UserQuery, UserQueryVariables>({
      query: User,
      variables: {}
    });
    if (!userRes.data || !userRes.data.user) {
      throw new Error('cannot get user data');
    }
    const userData = userRes.data.user;
    username = userData.username;
  }
  configData.username = username;
  cacheData.username = username;
  await writeCache();
};
