import jwt from 'jsonwebtoken';
import { store } from '../reduxWrapper';
import { logout, setToken } from './actions';
import { axiosClient } from 'utils/axios';
import { runLogout } from './thunks';
import { RootState } from '..';
import { definitions as restDef } from 'lib/generated/apiREST';

export const getAuthToken = (): string => {
  return (store.getState() as RootState).authReducer.authToken;
};

export const getOauthToken = (): string => {
  return (store.getState() as RootState).authReducer.oauthID;
};

export const refreshAuth = async (): Promise<void> => {
  const refreshTokenRes = await axiosClient.post<restDef['RestReturnObj']>(
    '/refreshToken',
    {},
    {
      withCredentials: true,
    }
  );
  store.dispatch(setToken(refreshTokenRes.data.data as string));
};

export const getUsername = (): string => {
  const state = (store.getState() as RootState).authReducer;
  if (!state.loggedIn) {
    return '';
  }
  return state.username;
};

export const isLoggedIn = async (): Promise<boolean> => {
  const state = (store.getState() as RootState).authReducer;
  if (!state.loggedIn) {
    return false;
  }
  const checkAuthCallback = async (): Promise<boolean> => {
    try {
      await refreshAuth();
      const state = (store.getState() as RootState).authReducer;
      return state.authToken !== undefined && state.authToken.length > 0;
    } catch (err) {
      try {
        await axiosClient.get('/hello');
        await runLogout();
      } catch (err) {
        // cannot connect to server
      }
      store.dispatch(logout());
    }
    return false;
  };

  if (state.authToken && state.authToken.length === 0) {
    return await checkAuthCallback();
  }
  try {
    const keys = jwt.decode(state.authToken);
    if (keys === null || typeof keys === 'string') {
      return await checkAuthCallback();
    }
    const exp: number = keys['exp'];
    if (!exp) {
      return await checkAuthCallback();
    }
    if (Date.now() >= exp * 1000) {
      return await checkAuthCallback();
    }
  } catch (err) {
    return await checkAuthCallback();
  }
  return true;
};
