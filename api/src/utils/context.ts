import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { decodeAuth, AuthData, jwtType } from "../auth/jwt";

export interface GraphQLContext {
  auth?: AuthData;
}

export interface SubscriptionContextParams {
  authToken?: string;
}

export const onSubscription = async (params: SubscriptionContextParams): Promise<GraphQLContext> => {
  if (!params.authToken) {
    // require at least guest login
    throw new Error('auth token must be provided');
  }
  let authData: AuthData | undefined;
  try {
    authData = await decodeAuth(jwtType.LOCAL, params.authToken);
  } catch (err) {
    // does not allow github subscriptions
    throw new Error('invalid auth token');
  }
  return {
    auth: authData
  };
};

export const getContext = async ({ req, connection }: ExpressContext): Promise<GraphQLContext> => {
  if (connection) {
    return connection.context as GraphQLContext;
  }
  if (!(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')) {
    // don't require any authorization
    return {};
  }
  const token = req.headers.authorization.split(' ')[1];
  let authData: AuthData | undefined;
  try {
    authData = await decodeAuth(jwtType.LOCAL, token);
  } catch (err) {
    try {
      authData = await decodeAuth(jwtType.GITHUB, token);
    } catch (err) {
      throw new Error('invalid auth token');
    }
  }
  return {
    auth: authData
  };
};
