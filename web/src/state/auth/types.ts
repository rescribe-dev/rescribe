export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const SET_TOKEN = 'SET_TOKEN';
export const SET_USER = 'SET_USER';

export interface UserType {
  _id: string;
  name: string;
  email: string;
  plan: string;
  type: string;
}

export interface Login {
  email: string;
  authToken: string;
  loggedIn: boolean;
}

export interface AuthState {
  authToken: string;
  email: string;
  user: UserType | undefined;
  loggedIn: boolean;
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
  payload: UserType;
}

export type AuthActionTypes =
  | LoginAction
  | LogoutAction
  | SetTokenAction
  | SetUserAction;
