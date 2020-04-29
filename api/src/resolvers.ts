import { IResolvers } from 'graphql-tools';
import authMutations from './auth/mutations';
import authQueries from './auth/queries';
import authSubscriptions from './auth/subscriptions';
import fileMutations from './files/mutations';
import fileQueries from './files/queries';

const resolvers: IResolvers = {
  Subscription: {
    ...authSubscriptions(),
  },
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
