import { sign, verify, SignOptions, VerifyOptions } from 'jsonwebtoken';
import { Request } from 'express';
import { nanoid } from 'nanoid';
import User, { UserType, UserModel } from '../schema/users/user';
import { configData } from './config';
import { getProduct } from '../products/product.resolver';
import Restrictions from '../schema/payments/restrictions';
import { defaultProductName } from '../shared/variables';
import { Scope, ScopeCategory, ScopeLevel } from '../schema/users/token';
import { loginType } from '../auth/shared';

export interface JWTAuthData {
  id: string;
  plan: string;
  type: string;
  emailVerified: boolean;
}

export interface AuthData {
  id: string;
  plan: string;
  restrictions: Restrictions;
  type: string;
  emailVerified: boolean;
  scopes: Scope[];
  loginType: loginType;
}

export interface RefreshTokenData {
  id: string;
  tokenVersion: number;
}

const accessJWTExpiration = '2h';
const refreshJWTExpiration = '2h';
export const verifyJWTExpiration = '1h';

export enum VerifyType {
  verify = 'verify',
  verifyNewsletter = 'verifyNewsletter'
}

export const getSecret = (type: loginType): string => {
  let secret: string | undefined;
  switch (type) {
    case loginType.LOCAL:
      secret = configData.JWT_SECRET;
      break;
    case loginType.GITHUB:
      secret = configData.GITHUB_PRIVATE_KEY;
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

export const getJWTIssuer = (): string => {
  const jwtIssuer = configData.JWT_ISSUER;
  if (!jwtIssuer) {
    throw new Error('no jwt issuer found');
  }
  return jwtIssuer;
};

export const generateJWTGuest = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    let secret: string;
    let jwtIssuer: string;
    try {
      secret = getSecret(loginType.LOCAL);
      jwtIssuer = getJWTIssuer();
    } catch (err) {
      reject(err as Error);
      return;
    }
    const authData: JWTAuthData = {
      id: nanoid(),
      plan: defaultProductName,
      type: UserType.visitor,
      emailVerified: false,
    };
    const signOptions: SignOptions = {
      issuer: jwtIssuer,
      expiresIn: accessJWTExpiration
    };
    sign(authData, secret, signOptions, (err, token) => {
      if (err) {
        reject(err as Error);
      } else {
        resolve(token as string);
      }
    });
  });
};

export const generateJWTAccess = (user: User): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    let secret: string;
    let jwtIssuer: string;
    try {
      secret = getSecret(loginType.LOCAL);
      jwtIssuer = getJWTIssuer();
    } catch (err) {
      reject(err as Error);
      return;
    }
    if (!user._id) {
      reject('id required');
      return;
    }
    const authData: JWTAuthData = {
      id: user._id.toHexString(),
      plan: user.plan,
      type: user.type,
      emailVerified: user.emailVerified,
    };
    const signOptions: SignOptions = {
      issuer: jwtIssuer,
      expiresIn: accessJWTExpiration
    };
    sign(authData, secret, signOptions, (err, token) => {
      if (err) {
        reject(err as Error);
      } else {
        resolve(token as string);
      }
    });
  });
};

export const generateJWTRefresh = (user: User): Promise<string> => {
  return new Promise((resolve, reject) => {
    let secret: string;
    let jwtIssuer: string;
    try {
      secret = getSecret(loginType.LOCAL);
      jwtIssuer = getJWTIssuer();
    } catch (err) {
      reject(err as Error);
      return;
    }
    if (!user._id) {
      reject('id required');
      return;
    }
    const authData: RefreshTokenData = {
      id: user._id.toHexString(),
      tokenVersion: user.tokenVersion
    };
    const signOptions: SignOptions = {
      issuer: jwtIssuer,
      expiresIn: refreshJWTExpiration
    };
    sign(authData, secret, signOptions, (err, token) => {
      if (err) {
        reject(err as Error);
      } else {
        resolve(token as string);
      }
    });
  });
};

export const handleRefreshToken = (req: Request): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!req.cookies) {
      throw new Error('no cookies found');
    }
    const token = req.cookies.refreshToken as string | undefined;
    if (!token || token.length === 0) {
      throw new Error('no token provided');
    }
    let secret: string;
    try {
      secret = getSecret(loginType.LOCAL);
    } catch (err) {
      reject(err as Error);
      return;
    }
    const jwtConfig: VerifyOptions = {
      algorithms: ['HS256']
    };
    verify(token, secret, jwtConfig, async (err, res: any) => {
      try {
        if (err) {
          throw err as Error;
        }
        const user = await UserModel.findById(res.id);
        if (!user) {
          throw new Error('user not found');
        }
        if (user.tokenVersion !== res.tokenVersion) {
          throw new Error('user not found');
        }
        resolve(await generateJWTAccess(user));
      } catch (err) {
        const errObj = err as Error;
        reject(errObj);
      }
    });
  });
};

export const decodeAuth = (type: loginType, token: string): Promise<AuthData> => {
  return new Promise((resolve, reject) => {
    try {
      const secret = getSecret(type);
      let jwtConfig: VerifyOptions;
      if (type === loginType.LOCAL) {
        jwtConfig = {
          algorithms: ['HS256']
        };
      } else if (type === loginType.GITHUB) {
        jwtConfig = {
          algorithms: ['RS256']
        };
      } else {
        jwtConfig = {};
      }
      verify(token, secret, jwtConfig, async (err, res: any) => {
        try {
          if (err) {
            throw err as Error;
          }
          let data: AuthData;
          if (type === loginType.LOCAL) {
            const inputData = res as JWTAuthData;
            data = {
              id: inputData.id,
              plan: inputData.plan,
              restrictions: {
                ...(await getProduct({
                  name: inputData.plan
                }))
              },
              type: inputData.type,
              emailVerified: inputData.emailVerified,
              scopes: [{
                category: ScopeCategory.all,
                level: ScopeLevel.write,
              }],
              loginType: type,
            };
          } else if (type === loginType.GITHUB) {
            data = {
              id: nanoid(),
              plan: defaultProductName,
              restrictions: {
                ...(await getProduct({
                  name: defaultProductName
                }))
              },
              type: UserType.github,
              emailVerified: true,
              scopes: [{
                category: ScopeCategory.all,
                level: ScopeLevel.write,
              }],
              loginType: type,
            };
          } else {
            throw new Error('invalid type for jwt');
          }
          resolve(data);
        } catch (err) {
          const errObj = err as Error;
          reject(errObj);
        }
      });
    } catch (err) {
      const errObj = err as Error;
      reject(errObj);
    }
  });
};
