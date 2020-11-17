import { Request, Response } from 'express';
import { getToken } from './context';
import statusCodes from 'http-status-codes';

export type ExpressHandlerType = (req: Request, res: Response) => Promise<string>;

export const authHandler = async (key: string, callback: ExpressHandlerType, req: Request, res: Response): Promise<void> => {
  try {
    const token = getToken(req);
    if (token.length === 0) {
      throw new Error('no authentication provided');
    }
    if (token !== key) {
      throw new Error('invalid token provided');
    }
    const message = await callback(req, res);
    res.status(statusCodes.OK).json({
      message
    });
  } catch (err) {
    const errObj = err as Error;
    res.status(statusCodes.UNAUTHORIZED).json({
      message: errObj.message
    });
  }
};
