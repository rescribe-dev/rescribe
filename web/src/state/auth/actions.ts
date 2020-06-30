import {
  AuthActionTypes,
  LOGIN,
  LOGOUT,
  Login,
  SET_TOKEN,
  SET_USER,
} from './types';
import { UserFieldsFragment } from 'lib/generated/datamodel';

export const login = (auth: Login): AuthActionTypes => {
  return {
    type: LOGIN,
    payload: auth,
  };
};

export const logout = (): AuthActionTypes => {
  return {
    type: LOGOUT,
    payload: undefined,
  };
};

export const setToken = (token: string): AuthActionTypes => {
  return {
    type: SET_TOKEN,
    payload: token,
  };
};

export const setUser = (user: UserFieldsFragment): AuthActionTypes => {
  return {
    type: SET_USER,
    payload: user,
  };
};
