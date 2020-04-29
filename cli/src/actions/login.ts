import { getLogger } from "log4js";
import { Arguments } from 'yargs';
import { websiteURL, createApolloClient, defaultApolloClient } from "../utils/api";
import gql from "graphql-tag";
import { writeError } from "../utils/logger";
import { setAuthToken } from "../utils/authToken";

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
    let loginTimeout: NodeJS.Timeout|undefined;
    try {
      logger.info('start login');
      const loginGuestRes = await defaultApolloClient.query({
        query: gql`
          query loginGuest {
            loginGuest
          }
        `
      });
      const authToken = loginGuestRes.data.loginGuest;
      const authenticatedApolloClient = await createApolloClient(authToken);
      closeLoginSubscription();
      loginTimeout = setTimeout(() => {
        closeLoginSubscription();
        reject(new Error('login timed out'));
      }, waitTime);
      loginSubscription = authenticatedApolloClient.subscribe<AuthNotifications>({
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
            setAuthToken(res.data.authNotifications.token);
            resolve();
          }
        },
        error: (err: Error) => {
          writeError(err.message);
        }
      });
      console.log(`login at ${websiteURL}?token=${authToken}&redirect=cli`);
    } catch(err) {
      if (loginTimeout) {
        clearTimeout(loginTimeout);
      }
      closeLoginSubscription();
      reject(err as Error);
    }
  });
};
