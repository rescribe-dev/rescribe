import { getLogger } from 'log4js';
import { Arguments } from 'yargs';
import { apolloClient } from '../utils/api';
import chalk from 'chalk';
import { UserDataQuery, UserData, UserDataQueryVariables } from '../lib/generated/datamodel';

const logger = getLogger();

export default async (_args: Arguments): Promise<void> => {
  logger.info('get User');
  const userRes = await apolloClient.query<UserDataQuery, UserDataQueryVariables>({
    query: UserData,
    variables: {}
  });
  const user = userRes.data.user;
  if (!user) {
    throw new Error('no user found');
  }
  console.log(chalk.green(`user: ${user.name}, email: ${user.email}, plan: ${user.plan}`));
};
