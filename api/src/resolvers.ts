import { IResolvers } from 'graphql-tools';
import fileMutations from './files/mutations';
import fileQueries from './files/queries';

const resolvers: IResolvers = {
  Mutation: {
    ...fileMutations(),
  },
  Query: {
    hello(): string {
      return `Hello world! 🚀`;
    },
    ...fileQueries(),
  },
};

export default resolvers;
