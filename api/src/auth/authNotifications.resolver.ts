import { GraphQLContext } from '../utils/context';
import { Resolver, Subscription, ResolverFilterData, Root } from 'type-graphql';
import { authNotificationsTrigger } from './shared';
import { AuthNotificationPayload, AuthNotification } from './authNotificationType';

@Resolver()
class AuthNotifications {
  @Subscription(_returns => AuthNotification, {
    topics: authNotificationsTrigger,
    filter: ({ payload, context }: ResolverFilterData<AuthNotificationPayload, any, GraphQLContext>) => {
      return context.auth !== undefined && payload.id === context.auth.id;
    }
  })
  authNotifications(
    @Root() notificationPayload: AuthNotificationPayload,
  ): AuthNotification {
    return {
      ...notificationPayload
    };
  }
}

export default AuthNotifications;
