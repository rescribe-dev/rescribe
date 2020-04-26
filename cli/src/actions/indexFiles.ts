import fs, { readFileSync, lstatSync } from 'fs';
import { getLogger } from "log4js";
import { beforeAction, handleStringList } from "../utils/cli";
import FormData from 'form-data';
import mime from 'mime-types';
import { isBinaryFile } from "isbinaryfile";
import gql from 'graphql-tag';
import { promisify } from 'util';
import { basename } from 'path';
import { axiosClient } from '../utils/api';
import { AxiosError } from 'axios';
import { ApolloQueryResult } from 'apollo-boost';
import { print } from 'graphql/language/printer';

const logger = getLogger();

const exists = promisify(fs.exists);

interface ResIndex {
  indexFiles: string;
}

export default (pathsStr: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    beforeAction();
    const paths = handleStringList(pathsStr);
    let filesFound = 0;
    const form = new FormData();
    form.append('operations', JSON.stringify({
      query: print(gql`
        mutation indexFiles($files: [Upload!]!, $paths: [String!]!, $repository: ID!, $branch: ID!) {
          indexFiles(files: $files, paths: $paths, repository: $repository, branch: $branch)
        }
      `),
      variables: {
        files: paths.map(() => null),
        paths: paths,
        repository: 'test',
        branch: 'master'
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
      exists(path).then(async (exists) => {
        if (exists) {
          logger.info(`found file "${path}"`);
          const buffer = readFileSync(path);
          const stats = lstatSync(path);
          if (await isBinaryFile(buffer, stats.size)) {
            reject(new Error(`file "${path}" is binary`));
          } else {
            const name = basename(path);
            const lookupType = mime.lookup(path);
            const mimeType = lookupType ? lookupType : 'text/plain';
            form.append(currentIndex.toString(), buffer, {
              filename: name,
              contentType: mimeType
            });
            filesFound++;
            if (filesFound === paths.length) {
              const formLength = form.getLengthSync();
              try {
                const res = await axiosClient.post('/graphql', form, {
                  headers: {
                    ...form.getHeaders(),
                    'content-length': formLength
                  }
                });
                const apolloRes = res.data as ApolloQueryResult<ResIndex>;
                if (apolloRes.errors) {
                  reject(new Error(apolloRes.errors.map(elem => elem.message).join(', ')));
                } else {
                  logger.info(`done indexing "${path}"`);
                  console.log(apolloRes.data.indexFiles);
                }
              } catch(err) {
                const errObj = err as AxiosError;
                if (errObj.response) {
                  reject(new Error(errObj.response.data));
                }
                reject(errObj as Error);
              }
              resolve();
            } 
          }
        } else {
          reject(new Error(`cannot find file "${path}"`));
        }
      }).catch((err) => {
        reject(err as Error);
      });
    }
  });
};
