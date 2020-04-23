import { IResolvers } from 'graphql-tools';
import authMutations from './auth/mutations';
import authQueries from './auth/queries';
import fileMutations from './files/mutations';
import fileQueries from './files/queries';

const resolvers: IResolvers = {
  Mutation: {
    ...fileMutations(),
    ...authMutations(),
  },
  Query: {
    hello(): string {
      return `Hello world! 🚀`;
    },
    ...fileQueries(),
    ...authQueries(),
  },
};

export default resolvers;
