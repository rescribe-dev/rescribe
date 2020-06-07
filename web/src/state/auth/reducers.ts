import {
  AuthState,
  AuthActionTypes,
  LOGIN,
  SET_TOKEN,
  SET_USER,
  LOGOUT,
} from './types';

const initialState: AuthState = {
  authToken: '',
  username: '',
  user: undefined,
  loggedIn: false,
};

export const authReducer = (
  state = initialState,
  action: AuthActionTypes
): AuthState => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        ...action.payload,
      };
    case LOGOUT:
      return initialState;
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
