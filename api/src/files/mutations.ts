import { IResolverObject, gql } from "apollo-server-express";
import { FileUpload } from 'graphql-upload';
import { getLogger } from 'log4js';
import { nanoid } from 'nanoid';
import { fileIndexName } from '../elastic/configure';
import { elasticClient } from '../elastic/init';
import { ElasticFile } from '../elastic/types';
import { createClient } from "../utils/github";
import { processFile } from "../utils/antlrBridge";
import { print } from 'graphql/language/printer';
import { isBinaryFile } from "isbinaryfile";
import { GraphQLContext } from "../utils/context";
import { verifyGithub } from "../auth/checkAuth";

interface FileIndexInput {
  files: Promise<FileUpload>[];
  paths: string[];
  repository: string;
  branch: string;
}

interface DeleteFileInput {
  id: string;
}

interface GithubIndexInput {
  paths: string[];
  ref: string;
  repositoryName: string;
  repositoryOwner: string;
  installationID: number;
}

interface GithubFileRes {
  isBinary: boolean;
  text: string;
}

const logger = getLogger();

/* eslint-disable @typescript-eslint/no-unused-vars */

const indexFile = async (content: string, fileName: string, 
  project: string, path: string, repositoryName: string): Promise<string> => {
  const fileData = await processFile({
    name: fileName,
    contents: content,
  });
  const currentTime = new Date().getTime();
  const id = nanoid();
  const elasticContent: ElasticFile = {
    _id: id,
    project,
    content,
    path: path,
    repository: repositoryName,
    name: fileName,
    created: currentTime,
    updated: currentTime,
  };
  const indexResult = await elasticClient.index({
    index: fileIndexName,
    body: elasticContent
  });
  logger.info(`got update result of ${JSON.stringify(indexResult.body)}`);
  return `indexed file with id ${id}`;
};

const mutations = (): IResolverObject => {
  return {
    async indexGithub(_: any, args: GithubIndexInput, ctx: GraphQLContext): Promise<string> {
      return new Promise(async (resolve, reject) => {
        if (!verifyGithub(ctx)) {
          reject(new Error('invalid token provided'));
          return;
        }
        // https://github.com/octokit/graphql.js/
        // https://developer.github.com/v4/explorer/
        // https://github.community/t5/GitHub-API-Development-and/GraphQL-getting-filename-file-content-and-commit-date/td-p/17861
        const githubClient = createClient(args.installationID);
        try {
          for (const filePath of args.paths) {
            const expression = `${args.ref}:${filePath}`;
            const res = await githubClient(print(gql`
              query files($name: String!, $owner: String!, $expression: String!) { 
                repository(name: $name, owner: $owner) { 
                  object(expression: $expression) {
                    ...on Blob {
                      isBinary
                      text
                    }
                  }
                }
              }
            `), {
              expression,
              name: args.repositoryName,
              owner: args.repositoryOwner
            });
            if (!res) {
              throw new Error(`no response found for file query ${expression}`);
            }
            const fileData = res.repository.object as GithubFileRes;
            // logger.info(res);
            if (fileData.isBinary) {
              logger.info(`file ${expression} is binary`);
            } else {
              logger.info(`file contents: "${fileData.text}"`);
              // TODO - elasticsearch ingestion here
              // indexFile();
            }
          }
          resolve(`successfully processed repo ${args.repositoryName}`);
        } catch(err) {
          logger.error((err as Error).message);
          reject(err as Error);
        }
      });
    },
    async indexFiles(_: any, args: FileIndexInput): Promise<string> {
      return new Promise(async (resolve, reject) => {
        let numIndexed = 0;
        for (let i = 0; i < args.files.length; i++) {
          const file = await args.files[i];
          // see this: https://github.com/apollographql/apollo-server/issues/3508
          // currently added a resolution as per this:
          // https://github.com/apollographql/apollo-server/issues/3508#issuecomment-558717168
          // eventually this needs to be changed.
          const readStream = file.createReadStream();
          const data: Uint8Array[] = [];
          readStream.on('data', (chunk: Uint8Array) => data.push(chunk));
          readStream.on('error', reject);
          readStream.on('end', async () => {
            const buffer = Buffer.concat(data);
            if (await isBinaryFile(buffer)) {
              reject(new Error(`file ${file.filename} is binary`));
              return;
            }
            const content = buffer.toString('utf8');
            // indexFile(content);
            numIndexed++;
            if (numIndexed === args.files.length) {
              resolve(content);
            }
          });
        }
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
