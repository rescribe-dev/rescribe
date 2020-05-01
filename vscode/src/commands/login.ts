import * as vscode from 'vscode';
import { websiteURL, apolloClient, initializeApolloClient } from "../utils/api";
import gql from "graphql-tag";
import { setAuthToken } from "../utils/authToken";
import { configData } from "../utils/config";

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

export default async (context: vscode.ExtensionContext): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    let loginTimeout: NodeJS.Timeout | undefined;
    try {
      const loginGuestRes = await apolloClient.query({
        query: gql`
          query loginGuest {
            loginGuest
          }
        `
      });
      setAuthToken(loginGuestRes.data.loginGuest, context);
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
            const message = 'no data found in response';
            vscode.window.showErrorMessage(message);
          } else if (res.data.authNotifications) {
            if (loginTimeout) {
              clearTimeout(loginTimeout);
            }
            closeLoginSubscription();
            const message = 'successfully logged in!';
            vscode.window.showInformationMessage(message);
            setAuthToken(res.data.authNotifications.token, context);
            initializeApolloClient();
            resolve();
          }
        },
        error: (err: Error) => {
          const message = err.message;
          vscode.window.showErrorMessage(message);
        }
      });
      const loginURL = `${websiteURL}/login?token=${configData.authToken}&cli`;
      console.log(`login at ${loginURL}`);
      vscode.env.openExternal(vscode.Uri.parse(loginURL));
    } catch (err) {
      if (loginTimeout) {
        clearTimeout(loginTimeout);
      }
      closeLoginSubscription();
      reject(err as Error);
    }
  });
};
