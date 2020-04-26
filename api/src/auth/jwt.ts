import jwt from 'jsonwebtoken';
import { ObjectID } from 'mongodb';
import User from './type';

export const enum jwtType { LOCAL, GITHUB }

export interface AuthData {
  id: ObjectID;
  plan: string;
  type: string;
  emailVerified: boolean;
}

const jwtExpiration = '2h';

const getSecret = (type: jwtType): string => {
  let secret: string | undefined;
  switch (type) {
    case jwtType.LOCAL:
      secret = process.env.JWT_SECRET;
      break;
    case jwtType.GITHUB:
      secret = process.env.GITHUB_PRIVATE_KEY;
      break;
    default:
      secret = undefined;
      break;
  }
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

export const generateJWT = (user: User): Promise<string> => {
  return new Promise((resolve, reject) => {
    let secret: string;
    let jwtIssuer: string;
    try {
      secret = getSecret(jwtType.LOCAL);
      jwtIssuer = getJWTIssuer();
    } catch(err) {
      reject(err as Error);
      return;
    }
    if (!user._id) {
      reject('id required');
      return;
    }
    const authData: AuthData = {
      id: user._id,
      plan: user.plan,
      type: user.type,
      emailVerified: user.emailVerified,
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

export const decodeAuth = (type: jwtType, token: string): Promise<AuthData | undefined> => {
  return new Promise((resolve, reject) => {
    let secret: string;
    try {
      secret = getSecret(type);
    } catch(err) {
      reject(err as Error);
      return;
    }
    jwt.verify(token, secret, {
      algorithms: jwtType.LOCAL ? ['HS256'] : jwtType.GITHUB ? ['RS256'] : [],
    }, (err, res: any) => {
      if (err) {
        reject(err as Error);
      } else {
        let data: AuthData | undefined;
        if (type === jwtType.LOCAL) {
          data = {
            id: new ObjectID(res.id),
            plan: res.plan,
            type: res.type,
            emailVerified: res.emailVerified
          };
        }
        resolve(data);
      }
    });
  });
};
