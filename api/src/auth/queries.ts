import { IResolverObject } from 'apollo-server-express';
import IFile from './type';

interface IFileInput {
  id: string;
}

const queries = (): IResolverObject => {
  return {
    async file(_: any, _args: IFileInput): Promise<IFile> {
      return new Promise<IFile>((resolve, _reject) => {
        resolve();
      });
    },
  };
};

export default queries;
