import jwt from 'jsonwebtoken';
import { configData, cacheData, writeCache } from "./config";

export const isLoggedIn = (authToken: string): boolean => {
  let res = true;
  try {
    const keys = jwt.decode(authToken);
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
  return res;
};

export const setAuthToken = async (token: string): Promise<void> => {
  configData.authToken = token;
  cacheData.authToken = token;
  await writeCache();
};
