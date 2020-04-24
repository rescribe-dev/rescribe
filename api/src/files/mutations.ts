import { IResolverObject } from "apollo-server-express";
import { FileUpload } from 'graphql-upload';
import { getLogger } from 'log4js';
import { nanoid } from 'nanoid';
import { fileIndexName } from '../elastic/configure';
import { elasticClient } from '../elastic/init';
import { ElasticFile } from '../elastic/types';
import { createClient } from "../utils/github";
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

interface GithubIndexInput {
  files: string[];
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

const mutations = (): IResolverObject => {
  return {
    async indexGithub(_: any, args: GithubIndexInput): Promise<string> {
      return new Promise(async (resolve, reject) => {
        // https://github.com/octokit/graphql.js/
        const githubClient = createClient(args.installationID);
        try {
          for (const filePath of args.files) {
            const expression = `${args.ref}:${filePath}`
            const res = await githubClient(`
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
            `, {
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
              logger.info(`file ${expression} is binary`)
            } else {
              logger.info(`file contents: "${fileData.text}"`)
            }
          }
          resolve(`successfully processed repo ${args.repositoryName}`);
        } catch(err) {
          logger.error((err as Error).message);
          reject(err as Error);
        }
      });
    },
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




// repository(owner: "jschmidtnj", name: "garbage") {
//   ref(qualifiedName: "master") {
//     target {
//       ... on Commit {
//         id
//         history(first: 5) {
//           pageInfo {
//             hasNextPage
//           }
//           edges {
//             node {
//               messageHeadline
//               oid
//               message
//               author {
//                 name
//                 email
//                 date
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// }
// }