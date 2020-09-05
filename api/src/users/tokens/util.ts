import { AuthData } from '../../utils/jwt';
import { TokenModel } from '../../schema/users/token';
import { UserModel } from '../../schema/users/user';
import { getProduct } from '../../products/product.resolver';
import { loginType } from '../../auth/shared';
import { ApolloError } from 'apollo-server-express';
import { BAD_REQUEST } from 'http-status-codes';
import argon2 from 'argon2';

export const randomComponentLen = 18;
export const keyComponentLen = 21;
export const totalTokenLen = randomComponentLen + keyComponentLen;

export const validateAuthToken = (token: string): void => {
  if (token.length !== totalTokenLen) {
    throw new ApolloError('invalid token length', `${BAD_REQUEST}`);
  }
};

export const getTokenKey = (token: string): string => {
  return token.substr(0, keyComponentLen);
};

/**
 * note - must be used after validating the auth token
 * 
 * @param {string} token token input
 * @returns {AuthData} auth data
 */
export const decodeAuthToken = async (token: string): Promise<AuthData> => {
  // maybe in the future, maybe use sessions (with redis)
  // instead of getting the token data every time from mongo
  const tokenKey = getTokenKey(token);
  const tokenData = await TokenModel.findOne({
    key: tokenKey,
  });
  if (!tokenData) {
    throw new Error('cannot find auth token data');
  }
  if (!await argon2.verify(tokenData.hashedToken, token)) {
    throw new Error('token is invalid');
  }
  const expiration = new Date(tokenData.expires);
  const now = new Date();
  if (now > expiration) {
    throw new Error('the auth token is expired');
  }
  const userData = await UserModel.findById(tokenData.user);
  if (!userData) {
    throw new Error(`cannot find user with id ${tokenData.user.toHexString()}`);
  }
  return {
    emailVerified: userData.emailVerified,
    id: tokenData.user.toHexString(),
    plan: userData.plan,
    restrictions: {
      ...(await getProduct({
        name: userData.plan,
      }))
    },
    type: userData.plan,
    scopes: tokenData.scopes,
    loginType: loginType.TOKEN,
  };
};
