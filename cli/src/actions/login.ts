import { getLogger } from 'log4js';
import { Arguments } from 'yargs';
import { websiteURL, apolloClient, initializeApolloClient } from '../utils/api';
import gql from 'graphql-tag';
import { writeError } from '../utils/logger';
import { setAuthToken } from '../utils/authToken';
import { configData } from '../utils/config';

const logger = getLogger();

export let loginSubscription: ZenObservable.Subscription;

export const closeLoginSubscription = (): void => {
  if (loginSubscription && !loginSubscription.closed) {
    loginSubscription.unsubscribe();
  }
};

interface AuthNotifications {
  authNotifications?: {
    id: string;
    token: string;
  };
}

const waitTime = 20 * 60 * 1000;

export default async (_args: Arguments): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    let loginTimeout: NodeJS.Timeout | undefined;
    try {
      logger.info('start login');
      const loginGuestRes = await apolloClient.mutate({
        mutation: gql`
          mutation loginGuest {
            loginGuest
          }
        `
      });
      await setAuthToken(loginGuestRes.data.loginGuest);
      initializeApolloClient();
      closeLoginSubscription();
      loginTimeout = setTimeout(() => {
        closeLoginSubscription();
        reject(new Error('login timed out'));
      }, waitTime);
      loginSubscription = apolloClient.subscribe<AuthNotifications>({
        query: gql`
            subscription authNotifications {
              authNotifications {
                token
              }
            }
          `,
        variables: {}
      }).subscribe({
        next: res => {
          if (!res.data) {
            writeError('no data found in response');
          } else if (res.data.authNotifications) {
            if (loginTimeout) {
              clearTimeout(loginTimeout);
            }
            closeLoginSubscription();
            console.log('successfully logged in!');
            setAuthToken(res.data.authNotifications.token)
              .then(resolve)
              .catch(reject);
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
