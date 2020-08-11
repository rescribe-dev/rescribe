import { Request, Response } from 'express';
import { getToken } from './context';
import { UNAUTHORIZED } from 'http-status-codes';

type ExpressHandlerType = (req: Request, res: Response) => Promise<void>;

export const authHandler = async (key: string, callback: ExpressHandlerType, req: Request, res: Response): Promise<void> => {
  try {
    const token = getToken(req);
    if (token.length === 0) {
      throw new Error('no authentication provided');
    }
    if (token !== key) {
      throw new Error('invalid token provided');
    }
    await callback(req, res);
  } catch (err) {
    const errObj = err as Error;
    res.status(UNAUTHORIZED).json({
      message: errObj.message
    });
  }
};
