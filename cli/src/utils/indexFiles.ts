import { getLogger } from "log4js";
import FormData from 'form-data';
import mime from 'mime-types';
import gql from 'graphql-tag';
import { basename } from 'path';
import { axiosClient, axiosRequestTimeout } from './api';
import { AxiosError } from 'axios';
import { ApolloQueryResult } from 'apollo-client';
import { print } from 'graphql/language/printer';
import { GraphQLError } from "graphql";
import axios from "axios";

const logger = getLogger();

interface ResIndex {
  indexFiles: string;
}

export default async (paths: string[], files: Buffer[], branchName: string): Promise<string> => {
  const form = new FormData();
  form.append('operations', JSON.stringify({
    query: print(gql`
      mutation indexFiles($files: [Upload!]!, $paths: [String!]!, $repository: String!, $branch: String!) {
        indexFiles(files: $files, paths: $paths, repository: $repository, branch: $branch)
      }
    `),
    variables: {
      files: paths.map(() => null),
      paths: paths,
      repository: 'test',
      branch: branchName
    }
  }));
  const map: any = {};
  for (let i = 0; i < paths.length; i++) {
    map[i] = [`variables.files.${i}`];
  }
  form.append('map', JSON.stringify(map));
  for (let i = 0; i < paths.length; i++) {
    const currentIndex = i;
    const path = paths[currentIndex];
    logger.info(`index file "${path}"`);
    const buffer = files[i];
    const name = basename(path);
    const lookupType = mime.lookup(path);
    const mimeType = lookupType ? lookupType : 'text/plain';
    form.append(currentIndex.toString(), buffer, {
      filename: name,
      contentType: mimeType
    });
  }
  const formLength = form.getLengthSync();
  try {
    const source = axios.CancelToken.source();
    const timeout = setTimeout(() => {
      source.cancel('network timeout');
    }, axiosRequestTimeout);
    const res = await axiosClient.post('/graphql', form, {
      headers: {
        ...form.getHeaders(),
        'content-length': formLength
      },
      cancelToken: source.token
    });
    clearTimeout(timeout);
    const apolloRes = res.data as ApolloQueryResult<ResIndex>;
    if (apolloRes.errors) {
      throw new Error(apolloRes.errors.map((elem: GraphQLError) => elem.message).join(', '));
    } else {
      return apolloRes.data.indexFiles.trim();
    }
  } catch(err) {
    const errObj = err as AxiosError;
    if (errObj.response) {
      throw new Error(errObj.response.data.errors.map((elem: GraphQLError) => elem.message).join(', '));
    } else {
      throw new Error(errObj.message);
    }
  }
};
