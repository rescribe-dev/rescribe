import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { decodeAuth, AuthData } from './jwt';
import { Request, Response } from 'express';
import { validateAuthToken, decodeAuthToken } from '../users/tokens/util';
import { loginType } from '../auth/shared';

export interface SubscriptionContext {
  auth?: AuthData;
}

export interface GraphQLContext extends SubscriptionContext {
  req: Request;
  res: Response;
}

export interface SubscriptionContextParams {
  authToken?: string;
}

export const onSubscription = async (params: SubscriptionContextParams): Promise<SubscriptionContext> => {
  if (!params.authToken) {
    // require at least guest login
    throw new Error('auth token must be provided');
  }

  return {
    auth: await decodeAuth(loginType.LOCAL, params.authToken)
  };
};

export const getToken = (req: Request): string => {
  if (!(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')) {
    // no authorization found
    return '';
  }
  return req.headers.authorization.split(' ')[1];
};

const githubUserAgent = 'rescribe-github-app';

const isGithubApp = (req: Request): boolean => {
  const userAgentHeader = req.headers['user-agent'];
  return userAgentHeader !== undefined && userAgentHeader === githubUserAgent;
};

const jwsRegex = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;

export const getContext = async ({ req, res, connection }: ExpressContext): Promise<GraphQLContext> => {
  if (connection) {
    return {
      ...(connection.context as SubscriptionContext),
      req,
      res
    };
  }
  const token = getToken(req);
  if (token.length === 0) {
    // don't require any authorization
    return {
      req,
      res
    };
  }
  let authData: AuthData | undefined;
  if (jwsRegex.test(token)) {
    if (isGithubApp(req)) {
      authData = await decodeAuth(loginType.GITHUB, token);
    } else {
      authData = await decodeAuth(loginType.LOCAL, token);
    }
  } else {
    validateAuthToken(token);
    // get from token
    authData = await decodeAuthToken(token);
  }
  return {
    auth: authData,
    req,
    res
  };
};
