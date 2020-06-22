import { getLogger } from 'log4js';
import { Arguments } from 'yargs';
import { websiteURL, apolloClient, initializeApolloClient } from '../utils/api';
import { writeError } from '../utils/logger';
import { setAuthToken, setUsername } from '../utils/authToken';
import { configData } from '../utils/config';
import {
  LoginGuest,
  LoginGuestMutationVariables,
  LoginGuestMutation,
  AuthNotifications,
  AuthNotificationsSubscriptionVariables,
  AuthNotificationsSubscription
} from '../lib/generated/datamodel';

const logger = getLogger();

export let loginSubscription: ZenObservable.Subscription;

export const closeLoginSubscription = (): void => {
  if (loginSubscription && !loginSubscription.closed) {
    loginSubscription.unsubscribe();
  }
};

const waitTime = 20 * 60 * 1000;

export default async (_args: Arguments): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    let loginTimeout: NodeJS.Timeout | undefined;
    try {
      logger.info('start login');
      const loginGuestRes = await apolloClient.mutate<LoginGuestMutation, LoginGuestMutationVariables>({
        mutation: LoginGuest,
        variables: {}
      });
      if (!loginGuestRes.data || !loginGuestRes.data.loginGuest) {
        throw new Error('cannot find guest token');
      }
      await setAuthToken(loginGuestRes.data.loginGuest);
      initializeApolloClient();
      closeLoginSubscription();
      loginTimeout = setTimeout(() => {
        closeLoginSubscription();
        reject(new Error('login timed out'));
      }, waitTime);
      loginSubscription = apolloClient.subscribe<AuthNotificationsSubscription, AuthNotificationsSubscriptionVariables>({
        query: AuthNotifications,
        variables: {}
      }).subscribe({
        next: async (res): Promise<void> => {
          if (!res.data) {
            writeError('no data found in response');
          } else if (res.data.authNotifications) {
            if (loginTimeout) {
              clearTimeout(loginTimeout);
            }
            closeLoginSubscription();
            console.log('successfully logged in!');
            try {
              await setAuthToken(res.data.authNotifications.token);
              await setUsername();
            } catch(err) {
              reject(err);
            }
            resolve();
          }
        },
        error: (err: Error) => {
          writeError(err.message);
        }
      });
      console.log(`login at ${websiteURL}/login?token=${configData.authToken}&cli`);
    } catch (err) {
      if (loginTimeout) {
        clearTimeout(loginTimeout);
      }
      closeLoginSubscription();
      reject(err as Error);
    }
  });
};
