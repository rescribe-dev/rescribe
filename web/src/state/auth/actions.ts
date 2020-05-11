import {
  AuthActionTypes,
  LOGIN,
  LOGOUT,
  Login,
  SET_TOKEN,
  SET_USER,
  User,
} from './types';

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

export const setUser = (user: User): AuthActionTypes => {
  return {
    type: SET_USER,
    payload: user,
  };
};
