import { IResolverObject } from "apollo-server-express";
import bcrypt from 'bcrypt';
import { FileUpload } from 'graphql-upload';
import { getLogger } from 'log4js';
import { nanoid } from 'nanoid';
import { userCollection } from "../db/connect";
import { fileIndexName } from '../elastic/configure';
import { IElasticFile } from '../elastic/types';
import { processFile } from "../utils/antlrBridge";
import IUser from "./type";

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

const mutations = (): IResolverObject => {
  return {
    async register(_: any, args: IRegisterInput): Promise<string> {
      return new Promise<string>(async (resolve, reject) => {
        try {
          if (!emailVerificationRegex.test(args.email)) {
            reject(new Error('invalid email provided'));
          }
          if (await userCollection.countDocuments({
            email: args.email,
          }) !== 0) {
            reject(new Error('user with email already registered'));
          }
          const hashedPassword = await bcrypt.hash(args.password, saltRounds);
          const newUser: IUser = {
            name: args.name,
            email: args.email,
            password: hashedPassword,
          };
          const userCreateRes = await userCollection.insertOne(newUser);
          resolve(`created user ${userCreateRes.insertedId}`);
        } catch(err) {
          reject(err as Error);
        }
      });
    },
  };
};

export default mutations;
