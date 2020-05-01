export const LOGIN = "LOGIN";
export const LOGOUT = "LOGOUT";
export const SET_TOKEN = "SET_TOKEN";
export const SET_USER = "SET_USER";

export interface User {
  name: string;
  email: string;
  plan: string;
  type: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface Login extends LoginInput {
  authToken: string;
}

export interface AuthState {
  loggedIn: boolean;
  authToken: string;
  email: string;
  user: User | undefined;
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
  payload: User;
}

export type AuthActionTypes =
  | LoginAction
  | LogoutAction
  | SetTokenAction
  | SetUserAction;
