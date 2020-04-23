import { IResolverObject } from "apollo-server-express";
import bcrypt from 'bcrypt';
import { getLogger } from 'log4js';
import { ObjectID } from "mongodb";
import { userCollection } from "../db/connect";
import { IGraphQLContext } from "../utils/context";
import { verifyAdmin, verifyLoggedIn } from "./checkAuth";
import IUser, { plans, userTypes } from "./type";

const saltRounds = 10;

// from https://emailregex.com/
const emailVerificationRegex = 
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

interface IRegisterInput {
  name: string;
  email: string;
  password: string;
}

const logger = getLogger();

interface IDeleteInput {
  email?: string;
}

const accountExists = async (email: string): Promise<boolean> => {
  return await userCollection.countDocuments({
    email,
  }) !== 0;
};

const mutations = (): IResolverObject => {
  return {
    async register(_: any, args: IRegisterInput): Promise<string> {
      return new Promise<string>(async (resolve, reject) => {
        try {
          if (!emailVerificationRegex.test(args.email)) {
            throw new Error('invalid email provided');
          }
          if (await accountExists(args.email)) {
            throw new Error('user with email already registered');
          }
          const hashedPassword = await bcrypt.hash(args.password, saltRounds);
          const newUser: IUser = {
            name: args.name,
            email: args.email,
            password: hashedPassword,
            plan: plans.free,
            type: userTypes.user
          };
          const userCreateRes = await userCollection.insertOne(newUser);
          resolve(`created user ${userCreateRes.insertedId}`);
        } catch(err) {
          const theError: Error = err;
          logger.error(theError.message);
          reject(theError as Error);
        }
      });
    },
    async deleteAccount(_: any, args: IDeleteInput, ctx: IGraphQLContext): Promise<string> {
      return new Promise<string>(async (resolve, reject) => {
        try {
          const isAdmin = args.email !== undefined;
          if (isAdmin) {
            if (!verifyAdmin(ctx)) {
              throw new Error('user not admin');
            }
          } else {
            if (!verifyLoggedIn(ctx)) {
              throw new Error('user not logged in');
            }
          }
          let userData: IUser;
          const filter: any = {};
          if (!isAdmin) {
            filter._id = new ObjectID(ctx.auth?.id);
          } else {
            filter.email = args.email;
          }
          const userFindRes = await userCollection.findOne(filter);
          if (!userFindRes) {
            throw new Error('no user found');
          }
          userData = userFindRes;
          if (!userData._id) {
            throw new Error('no user id found');
          }
          await userCollection.deleteOne({
            _id: userData._id
          });
          resolve(`deleted user ${userData._id.toHexString()}`);
        } catch(err) {
          reject(err as Error);
        }
      });
    },
  };
};

export default mutations;
