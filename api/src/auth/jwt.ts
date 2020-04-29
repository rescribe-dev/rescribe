import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import User, { plans, userTypes } from './type';
import { nanoid } from 'nanoid';

export const enum jwtType { LOCAL, GITHUB }

export interface AuthData {
  id: string;
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

export const generateJWT = (user?: User): Promise<string> => {
  return new Promise((resolve, reject) => {
    let secret: string;
    let jwtIssuer: string;
    try {
      secret = getSecret(jwtType.LOCAL);
      jwtIssuer = getJWTIssuer();
    } catch (err) {
      reject(err as Error);
      return;
    }
    let authData: AuthData;
    const signOptions: SignOptions = {
      issuer: jwtIssuer
    };
    if (!user) {
      authData = {
        id: nanoid(),
        plan: plans.free,
        type: userTypes.visitor,
        emailVerified: false,
      };
    } else {
      if (!user._id) {
        reject('id required');
        return;
      }
      authData = {
        id: user._id.toHexString(),
        plan: user.plan,
        type: user.type,
        emailVerified: user.emailVerified,
      };
      signOptions.expiresIn = jwtExpiration;
    }
    jwt.sign(authData, secret, signOptions, (err, token) => {
      if (err) {
        reject(err as Error);
      } else {
        resolve(token as string);
      }
    });
  });
};

export const decodeAuth = (type: jwtType, token: string): Promise<AuthData> => {
  return new Promise((resolve, reject) => {
    let secret: string;
    try {
      secret = getSecret(type);
    } catch (err) {
      reject(err as Error);
      return;
    }
    let jwtConfig: VerifyOptions;
    if (type === jwtType.LOCAL) {
      jwtConfig = {
        algorithms: ['HS256']
      };
    } else if (type === jwtType.GITHUB) {
      jwtConfig = {
        algorithms: ['RS256']
      };
    } else {
      jwtConfig = {};
    }
    jwt.verify(token, secret, jwtConfig, (err, res: any) => {
      if (err) {
        reject(err as Error);
      } else {
        let data: AuthData;
        if (type === jwtType.LOCAL) {
          data = {
            id: res.id,
            plan: res.plan,
            type: res.type,
            emailVerified: res.emailVerified
          };
        } else {
          data = {
            id: nanoid(),
            plan: plans.free,
            type: userTypes.admin,
            emailVerified: true
          };
        }
        resolve(data);
      }
    });
  });
};
