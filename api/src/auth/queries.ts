import { IResolverObject } from 'apollo-server-express';
import bcrypt from 'bcrypt';
import { userCollection } from '../db/connect';
import { IGraphQLContext } from '../utils/context';
import { verifyLoggedIn } from './checkAuth';
import { generateJWT } from './jwt';
import IUser from './type';


interface ILoginInput {
  email: string;
  password: string;
}

const queries = (): IResolverObject => {
  return {
    async user(_: any, _args: any, ctx: IGraphQLContext): Promise<IUser> {
      return new Promise(async (resolve, reject) => {
        try {
          if (!verifyLoggedIn(ctx)) {
            throw new Error('user not logged in');
          }
          const userID = ctx.auth?.id;
          const user = await userCollection.findOne({
            _id: userID,
          });
          if (!user) {
            throw new Error(`cannot find user with id ${userID?.toHexString()}`);
          }
          resolve(user);
        } catch(err) {
          reject(err as Error);
        }
      });
    },
    async login(_: any, args: ILoginInput): Promise<string> {
      return new Promise(async (resolve, reject) => {
        try {
          const user = await userCollection.findOne({
            email: args.email
          });
          if (!user) {
            throw new Error(`cannot find user with email ${args.email}`);
          }
          if (!await bcrypt.compare(args.password, user.password)) {
            throw new Error('password is invalid');
          }
          const token = await generateJWT(user);
          resolve(token);
        } catch(err) {
          reject(err as Error);
        }
      });
    },
  };
};

export default queries;
