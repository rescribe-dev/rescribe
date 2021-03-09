import { Response } from 'express';
import { configData } from './config';
import { isProduction } from './mode';

const refreshCookieName = 'refreshToken';
const refreshCookiePath = '/refreshToken';

const sameSite = configData.PRODUCTION ? 'strict' : 'lax';

export const setRefreshToken = (res: Response, token: string): void => {
  res.cookie(refreshCookieName, token, {
    httpOnly: true,
    path: refreshCookiePath,
    secure: isProduction(),
    sameSite
  });
};

export const clearRefreshToken = (res: Response): void => {
  res.cookie(refreshCookieName, '', {
    httpOnly: true,
    path: refreshCookiePath,
    secure: isProduction(),
    sameSite
  });
};
