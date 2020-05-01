import * as vscode from 'vscode';
import { apolloClient } from "../utils/api";
import gql from "graphql-tag";
import { checkAuth } from '../utils/authToken';

interface User {
  name: string;
  email: string;
  plan: string;
  type: string;
}

interface UserRes {
  user: User;
}

export default async (_context: vscode.ExtensionContext): Promise<void> => {
  checkAuth();
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
  vscode.window.showInformationMessage(`user: ${user.name}, email: ${user.email}, plan: ${user.plan}`);
};
