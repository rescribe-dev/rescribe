import {
  AuthState,
  AuthActionTypes,
  LOGIN,
  SET_TOKEN,
  SET_USER,
  LOGOUT,
} from "./types";

const initialState: AuthState = {
  authToken: "",
  loggedIn: false,
  email: "",
  user: undefined,
};

export const authReducer = (
  state = initialState,
  action: AuthActionTypes
): AuthState => {
  if (action.type === LOGIN) {
    const authToken = action.payload.authToken;
    const loggedIn = action.payload.authToken.length > 0;
    return {
      ...state,
      authToken,
      loggedIn,
      email: loggedIn ? action.payload.email : "",
    };
  } else if (action.type === LOGOUT) {
    return initialState;
  } else if (action.type === SET_TOKEN) {
    return {
      ...state,
      authToken: action.payload,
    };
  } else if (action.type === SET_USER) {
    return {
      ...state,
      user: action.payload,
    };
  } else {
    return state;
  }
};
