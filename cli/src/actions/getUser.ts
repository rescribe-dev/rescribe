import { getLogger } from "log4js";
import { Arguments } from 'yargs';
import { apolloClient } from "../utils/api";
import gql from "graphql-tag";
import chalk from "chalk";

const logger = getLogger();

export let loginSubscription: ZenObservable.Subscription;

export const closeLoginSubscription = (): void => {
  if (loginSubscription && !loginSubscription.closed) {
    loginSubscription.unsubscribe();
  }
};

interface User {
  name: string;
  email: string;
  plan: string;
  type: string;
}

interface UserRes {
  user: User;
}

export default async (_args: Arguments): Promise<void> => {
  let loginTimeout: NodeJS.Timeout | undefined;
  try {
    logger.info('get User');
    const userRes = await apolloClient.query<UserRes>({
      query: gql`
        query user {
          user {
            name
            email
            plan
          }
        }
      `
    });
    const user = userRes.data.user;
    console.log(chalk.green(`user: ${user.name}, email: ${user.email}, plan: ${user.plan}`));
  } catch (err) {
    if (loginTimeout) {
      clearTimeout(loginTimeout);
    }
    closeLoginSubscription();
    throw err;
  }
};
