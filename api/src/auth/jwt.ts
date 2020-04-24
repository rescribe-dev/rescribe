import jwt from 'jsonwebtoken';
import { ObjectID } from 'mongodb';
import IUser from './type';

export interface IAuthData {
  id: ObjectID;
  plan: string;
  type: string;
}

const jwtExpiration = '2h';

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('no jwt secret found');
  }
  return secret;
};

const getJWTIssuer = (): string => {
  const jwtIssuer = process.env.JWT_ISSUER;
  if (!jwtIssuer) {
    throw new Error('no jwt issuer found');
  }
  return jwtIssuer;
};

export const generateJWT = (user: IUser): Promise<string> => {
  return new Promise((resolve, reject) => {
    let secret: string;
    let jwtIssuer: string;
    try {
      secret = getSecret();
      jwtIssuer = getJWTIssuer();
    } catch(err) {
      reject(err as Error);
      return;
    }
    if (!user._id) {
      reject('id required');
      return;
    }
    const authData: IAuthData = {
      id: user._id,
      plan: user.plan,
      type: user.type,
    };
    jwt.sign(authData, secret, {
      expiresIn: jwtExpiration,
      issuer: jwtIssuer
    }, (err, token) => {
      if (err) {
        reject(err as Error);
      } else {
        resolve(token as string);
      }
    });
  });
};

export const decodeAuth = (token: string): Promise<IAuthData> => {
  return new Promise((resolve, reject) => {
    let secret: string;
    try {
      secret = getSecret();
    } catch(err) {
      reject(err as Error);
      return;
    }
    jwt.verify(token, secret, {}, (err, res: any) => {
      if (err) {
        reject(err as Error);
      } else {
        const data: IAuthData = {
          id: new ObjectID(res.id),
          plan: res.plan,
          type: res.type
        };
        resolve(data);
      }
    });
  });
};
