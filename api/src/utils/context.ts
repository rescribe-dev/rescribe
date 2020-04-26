import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { decodeAuth, AuthData, jwtType } from "../auth/jwt";

export interface GraphQLContext {
  auth?: AuthData;
  authenticated: boolean;
}

export const getContext = async ({ req }: ExpressContext): Promise<GraphQLContext> => {
  const contextData: GraphQLContext = {
    authenticated: false
  };
  if (!(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')) {
    return contextData;
  }
  const token = req.headers.authorization.split(' ')[1];
  let authData: AuthData | undefined;
  try {
    authData = await decodeAuth(jwtType.LOCAL, token);
  } catch(err) {
    try {
      authData = await decodeAuth(jwtType.GITHUB, token);
    } catch(err) {
      return contextData;
    }
  }
  contextData.auth = authData;
  contextData.authenticated = true;
  return contextData;
};
