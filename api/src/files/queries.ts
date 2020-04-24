import { IResolverObject } from 'apollo-server-express';
import File from './type';

interface FileInput {
  id: string;
}

const queries = (): IResolverObject => {
  return {
    async file(_: any, _args: FileInput): Promise<File> {
      return new Promise((resolve, _reject) => {
        resolve();
      });
    },
  };
};

export default queries;
