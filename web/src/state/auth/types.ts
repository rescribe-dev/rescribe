import { UserFieldsFragment } from 'lib/generated/datamodel';
import { Theme } from '../../utils/theme';

export const LOGIN = 'LOGIN';
export const GENERATE_OAUTH_ID = 'GENERATE_OAUTH_ID';
export const LOGOUT = 'LOGOUT';
export const SET_TOKEN = 'SET_TOKEN';
export const SET_USER = 'SET_USER';
export const SET_THEME = 'SET_THEME';

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
  theme: Theme;
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

interface SetThemeAction {
  type: typeof SET_THEME;
  payload: Theme;
}

export type AuthActionTypes =
  | LoginAction
  | GenerateOauthID
  | LogoutAction
  | SetTokenAction
  | SetUserAction
  | SetThemeAction;
