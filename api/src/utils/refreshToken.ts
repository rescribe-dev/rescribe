import { Response } from 'express';

const refreshCookieName = 'refreshToken';
const refreshCookiePath = '/refreshToken';

export const setRefreshToken = (res: Response, token: string): void => {
  res.cookie(refreshCookieName, token, {
    httpOnly: true,
    path: refreshCookiePath
  });
};

export const clearRefreshToken = (res: Response): void => {
  res.cookie(refreshCookieName, '', {
    httpOnly: true,
    path: refreshCookiePath
  });
};
