import * as vscode from 'vscode';
import { apolloClient } from '../utils/api';
import { checkAuth } from '../utils/authToken';
import {
  User,
  UserQuery,
  UserQueryVariables,
} from '../lib/generated/datamodel';

export default async (context: vscode.ExtensionContext): Promise<void> => {
  checkAuth(context);
  const userRes = await apolloClient.query<UserQuery, UserQueryVariables>({
    query: User,
    variables: {},
  });
  const user = userRes.data.user;
  vscode.window.showInformationMessage(
    `user: ${user.name}, email: ${user.email}, plan: ${user.plan}`
  );
};
