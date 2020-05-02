import jwt from "jsonwebtoken";
import { store } from "../reduxWrapper";
import { logout } from "./actions";

export const getAuthToken = () => {
  return store.getState().authReducer.authToken;
};

export const getUser = () => {
  return store.getState().authReducer.user;
};

export const isLoggedIn = () => {
  const state = store.getState().authReducer;
  if (state.authToken.length === 0) {
    return false;
  }
  let res = true;
  try {
    const keys = jwt.decode(state.authToken);
    if (keys === null || typeof keys === "string") {
      return false;
    }
    const exp: number = keys["exp"];
    if (!exp) {
      return false;
    }
    if (Date.now() >= exp * 1000) {
      res = false;
    }
  } catch (err) {
    res = false;
  }
  if (!res) {
    store.dispatch(logout());
  }
  return res;
};
