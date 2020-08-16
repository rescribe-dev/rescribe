import {
  AuthState,
  AuthActionTypes,
  LOGIN,
  SET_TOKEN,
  SET_USER,
  LOGOUT,
  GENERATE_OAUTH_ID,
  SET_THEME,
} from './types';
import { Theme } from '../../utils/theme';

const initialState: AuthState = {
  authToken: '',
  username: '',
  oauthID: '',
  user: undefined,
  loggedIn: false,
  theme: Theme.light,
};

export const authReducer = (
  state = initialState,
  action: AuthActionTypes
): AuthState => {
  switch (action.type) {
    case SET_THEME:
      return {
        ...state,
        theme: action.payload,
      };
    case LOGIN:
      return {
        ...state,
        ...action.payload,
      };
    case LOGOUT:
      return initialState;
    case GENERATE_OAUTH_ID:
      return {
        ...state,
        oauthID: action.payload,
      };
    case SET_TOKEN:
      return {
        ...state,
        authToken: action.payload,
      };
    case SET_USER:
      return {
        ...state,
        user: action.payload,
        username: action.payload.username,
      };
    default:
      return state;
  }
};
