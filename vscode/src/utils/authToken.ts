import * as vscode from 'vscode';
import jwt from 'jsonwebtoken';
import { configData } from "./config";

export const authTokenKey = 'authToken';

export const setAuthToken = (token: string, context: vscode.ExtensionContext): void => {
  configData.authToken = token;
  context.globalState.update('authToken', token);
};

export const isLoggedIn = (context: vscode.ExtensionContext): boolean => {
  if (configData.authToken.length === 0) {
    const stateAuth = context.globalState.get<string>(authTokenKey);
    if (stateAuth === undefined) {
      return false;
    }
    configData.authToken = stateAuth;
  }
  let res = true;
  try {
    const keys = jwt.decode(configData.authToken);
    if (keys === null || typeof keys === "string") {
      return false;
    }
    const exp: number = keys["exp"];
    if (!exp) {
      return false;
    }
    if (Date.now() >= exp * 1000) {
      res = false;
    }
  } catch (err) {
    res = false;
  }
  if (!res) {
    setAuthToken('', context);
  }
  return res;
};

export const checkAuth = (context: vscode.ExtensionContext): void => {
  if (!isLoggedIn(context)) {
    throw new Error('user not authenticated');
  }
};
