import { IResolverObject } from "apollo-server-express";
import { FileUpload } from 'graphql-upload';
import { getLogger } from 'log4js';
import { nanoid } from 'nanoid';
import { fileIndexName } from '../elastic/configure';
import { elasticClient } from '../elastic/init';
import { ElasticFile } from '../elastic/types';
// import { processFile } from "../utils/antlrBridge";

interface FileIndexInput {
  path: string;
  file: FileUpload;
  project: string;
  repository: string;
}

interface DeleteFileInput {
  id: string;
}

const logger = getLogger();

const mutations = (): IResolverObject => {
  return {
    async indexFile(_: any, args: FileIndexInput): Promise<string> {
      return new Promise((resolve, reject) => {
        const readStream = args.file.createReadStream();
        const data: Uint8Array[] = [];
        readStream.on('data', (chunk: Uint8Array) => data.push(chunk));
        readStream.on('error', reject);
        readStream.on('end', async () => {
          const contents = Buffer.concat(data).toString('utf8');
          /*
          const fileProcessData = await processFile({
            name: args.file.filename,
            contents,
          });
          */
          const currentTime = new Date().getTime();
          const id = nanoid();
          const elasticContent: ElasticFile = {
            _id: id,
            project: args.project,
            content: contents,
            path: args.path,
            repository: args.repository,
            name: args.file.filename,
            created: currentTime,
            updated: currentTime,
          };
          const indexResult = await elasticClient.index({
            index: fileIndexName,
            body: elasticContent
          });
          logger.info(`got update result of ${JSON.stringify(indexResult.body)}`);
          resolve(`indexed file with id ${id}`);
        });
      });
    },
    async deleteFile(_: any, _args: DeleteFileInput): Promise<string> {
      return new Promise((resolve, _reject) => {
        resolve('not implemented');
      });
    },
  };
};

export default mutations;
