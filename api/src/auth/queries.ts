import { IResolverObject } from 'apollo-server-express';
import bcrypt from 'bcrypt';
import { userCollection } from '../db/connect';
import { generateJWT } from './jwt';
import IFile from './type';

interface IFileInput {
  id: string;
}

interface ILoginInput {
  email: string;
  password: string;
}

const queries = (): IResolverObject => {
  return {
    async file(_: any, _args: IFileInput): Promise<IFile> {
      return new Promise<IFile>((resolve, _reject) => {
        resolve();
      });
    },
    async login(_: any, args: ILoginInput): Promise<string> {
      return new Promise<string>(async (resolve, reject) => {
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
