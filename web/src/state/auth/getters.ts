import jwt from 'jsonwebtoken';
import { store } from '../reduxWrapper';
import { logout, setToken } from './actions';
import { axiosClient } from '../../utils/axios';
import { AuthState } from './types';
import { runLogout } from './thunks';

export const getAuthToken = () => {
  return store.getState().authReducer.authToken;
};

interface RefreshRes {
  accessToken: string;
}

export const refreshAuth = async (): Promise<void> => {
  const refreshTokenRes = await axiosClient.post<RefreshRes>(
    '/refreshToken',
    {},
    {
      withCredentials: true,
    }
  );
  store.dispatch(setToken(refreshTokenRes.data.accessToken));
};

export const isLoggedIn = async () => {
  const state = store.getState().authReducer as AuthState;
  if (!state.loggedIn) {
    return false;
  }
  const checkAuthCallback = async (): Promise<boolean> => {
    try {
      await refreshAuth();
      const state = store.getState().authReducer as AuthState;
      return state.authToken !== undefined && state.authToken.length > 0;
    } catch (err) {
      await runLogout();
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
