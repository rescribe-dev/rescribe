import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { decodeAuth, AuthData } from "../auth/jwt";

export interface GraphQLContext {
  auth?: AuthData;
}

export const getContext = async ({ req }: ExpressContext): Promise<GraphQLContext> => {
  const contextData: GraphQLContext = {};
  if (!(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')) {
    return contextData;
  }
  const token = req.headers.authorization.split(' ')[1];
  const authData = await decodeAuth(token);
  contextData.auth = authData;
  return contextData;
};
