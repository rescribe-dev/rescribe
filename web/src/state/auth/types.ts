import { UserFieldsFragment } from 'lib/generated/datamodel';

export const LOGIN = 'LOGIN';
export const GENERATE_OAUTH_ID = 'GENERATE_OAUTH_ID';
export const LOGOUT = 'LOGOUT';
export const SET_TOKEN = 'SET_TOKEN';
export const SET_USER = 'SET_USER';

export interface Login {
  authToken: string;
  loggedIn: boolean;
}

export interface AuthState {
  authToken: string;
  username: string;
  user: UserFieldsFragment | undefined;
  loggedIn: boolean;
  oauthID: string;
}

interface GenerateOauthID {
  type: typeof GENERATE_OAUTH_ID;
  payload: string;
}

interface LoginAction {
  type: typeof LOGIN;
  payload: Login;
}

interface LogoutAction {
  type: typeof LOGOUT;
  payload: void;
}

interface SetTokenAction {
  type: typeof SET_TOKEN;
  payload: string;
}

interface SetUserAction {
  type: typeof SET_USER;
  payload: UserFieldsFragment;
}

export type AuthActionTypes =
  | LoginAction
  | GenerateOauthID
  | LogoutAction
  | SetTokenAction
  | SetUserAction;
