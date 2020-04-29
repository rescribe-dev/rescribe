import { IResolverObject, withFilter } from 'apollo-server-express';
import { pubsub } from '../utils/pubsub';
import { GraphQLContext } from '../utils/context';

export const authNotificationsTrigger = 'AUTH_NOTIFICATION';

export interface AuthNotification {
  authNotifications: {
    id: string;
    token: string;
  };
}

const queries = (): IResolverObject => {
  return {
    authNotifications: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(authNotificationsTrigger),
        (payload: AuthNotification, _variables, context: GraphQLContext) => {
          return context.auth !== undefined && payload.authNotifications.id === context.auth.id;
        }
      )
    }
  };
};

export default queries;
