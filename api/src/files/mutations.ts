import { IResolverObject } from "apollo-server-express";
import { FileUpload } from 'graphql-upload';
import { getLogger } from 'log4js';
import { nanoid } from 'nanoid'
import { fileIndexName } from '../elastic/configure';
import { getElasticClient } from '../elastic/init';
import { IElasticFile } from '../elastic/types';
import { processFile } from "../utils/antlrBridge";

interface IIndexFileInput {
  path: string;
  file: FileUpload;
  project: string;
  repository: string;
}

interface IDeleteFileInput {
  id: string;
}

const logger = getLogger();

const mutations = (): IResolverObject => {
  const elasticClient = getElasticClient();
  return {
    async indexFile(_: any, args: IIndexFileInput): Promise<string> {
      return new Promise<string>((resolve, reject) => {
        const readStream = args.file.createReadStream()
        const data: Uint8Array[] = []
        readStream.on('data', (chunk: Uint8Array) => data.push(chunk))
        readStream.on('error', reject)
        readStream.on('end', async () => {
          const contents = Buffer.concat(data).toString('utf8')
          const fileProcessData = await processFile({
            name: args.file.filename,
            contents,
          })
          const currentTime = new Date().getTime()
          const id = nanoid()
          const elasticContent: IElasticFile = {
            _id: id,
            project: args.project,
            content: contents,
            path: args.path,
            repository: args.repository,
            name: args.file.filename,
            created: currentTime,
            updated: currentTime,
          }
          const indexResult = await elasticClient.index({
            index: fileIndexName,
            body: elasticContent
          })
          logger.info(`got update result of ${JSON.stringify(indexResult.body)}`)
          resolve(`indexed file with id ${id}`)
        })
      });
    },
    async deleteFile(_: any, _args: IDeleteFileInput): Promise<string> {
      return new Promise<string>((resolve, _reject) => {
        resolve('not implemented');
      });
    },
  }
};

export default mutations
