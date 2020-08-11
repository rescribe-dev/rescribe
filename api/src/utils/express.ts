import { Request, Response } from 'express';
import { getToken } from './context';
import { UNAUTHORIZED, OK } from 'http-status-codes';
import { getLogger } from 'log4js';

const logger = getLogger();

type ExpressHandlerType = (req: Request, res: Response) => Promise<string>;

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
    logger.info(message);
    res.status(OK).json({
      message
    });
  } catch (err) {
    const errObj = err as Error;
    res.status(UNAUTHORIZED).json({
      message: errObj.message
    });
  }
};
