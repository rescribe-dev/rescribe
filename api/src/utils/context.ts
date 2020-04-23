import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { decodeAuth, IAuthData } from "../auth/jwt";

export interface IGraphQLContext {
  auth?: IAuthData;
}

export const getContext = async ({ req }: ExpressContext) => {
  const contextData: IGraphQLContext = {};
  if (!(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')) {
    return contextData;
  }
  const token = req.headers.authorization.split(' ')[1];
  const authData = await decodeAuth(token);
  contextData.auth = authData;
  return contextData;
};
