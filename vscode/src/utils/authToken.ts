import * as vscode from 'vscode';
import { configData } from "./config";

export const authTokenKey = 'authToken';

export const checkAuth = (): void => {
  if (configData.authToken.length === 0) {
    throw new Error('user not authenticated');
  }
};

export const setAuthToken = (token: string, context: vscode.ExtensionContext): void => {
  configData.authToken = token;
  context.globalState.update('authToken', token);
};
