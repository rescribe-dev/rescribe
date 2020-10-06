import { gql } from 'apollo-server-express';
import { print } from 'graphql/language/printer';
import { graphql } from '@octokit/graphql/dist-types/types';
import { RequestInterface as restClientType } from '@octokit/types';
import { fromBuffer as readMime } from 'file-type';
import { maxFileUploadSize } from '../utils/variables';


interface BaseArgs {
  githubClientREST: restClientType;
  ref: string;
  path: string;
  repositoryName: string;
  repositoryOwner: string;
};

interface GithubFileRESTData {
  encoding: BufferEncoding;
  content: string;
};

const getGithubFileREST = async (args: BaseArgs): Promise<GithubFileRESTData> => {
  const res = await args.githubClientREST('GET /repos/:owner/:repo/contents/:path', {
    owner: args.repositoryOwner,
    path: args.path,
    repo: args.repositoryName,
  });
  return {
    content: res.data.content,
    encoding: res.data.encoding as BufferEncoding,
  };
};

interface GithubFileRes {
  repository: {
    isBinary: boolean;
    text: string;
  };
};

interface GithubFileData {
  isBinary: boolean;
  encoding: BufferEncoding;
  buffer: Buffer;
  mimeType: string;
};

export const getGithubFile = async (githubClient: graphql, args: BaseArgs): Promise<GithubFileData> => {
  const expression = `${args.ref}:${args.path}`;
  const res = await githubClient<GithubFileRes>(print(gql`
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
  let encoding: BufferEncoding;
  let content: string;
  if (res.repository.isBinary) {
    const githubData = await getGithubFileREST(args);
    encoding = githubData.encoding;
    content = githubData.content;
  } else {
    encoding = 'utf8';
    content = res.repository.text;
  }
  if (content.length > maxFileUploadSize) {
    throw new Error(`github file ${args.path} is larger than the max file size of ${maxFileUploadSize} bytes`);
  }
  const buffer = Buffer.from(content, encoding);
  const mimeTypeData = await readMime(buffer);
  if (!mimeTypeData) {
    throw new Error('cannot read mime type');
  }
  return {
    isBinary: res.repository.isBinary,
    buffer,
    encoding,
    mimeType: mimeTypeData.mime
  };
};
