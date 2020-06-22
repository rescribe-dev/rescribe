import fs, { readFileSync, lstatSync } from 'fs';
import { handleStringList } from '../utils/cli';
import { isBinaryFile } from 'isbinaryfile';
import { promisify } from 'util';
import indexFiles from '../utils/indexFiles';
import { Arguments } from 'yargs';
import { cacheData } from '../utils/config';
import glob from 'glob';
import { isLoggedIn } from '../utils/authToken';

const exists = promisify(fs.exists);

interface Args {
  files: string;
  branch: string;
}

export default async (args: Arguments<Args>): Promise<void> => {
  if (cacheData.repositoryOwner.length === 0 || cacheData.repository.length === 0) {
    throw new Error('owner and repository need to be set with <set-repository>');
  }
  if (!isLoggedIn(cacheData.authToken)) {
    throw new Error('user must be logged in to index files');
  }
  const files: Buffer[] = [];
  const paths: string[] = [];
  const filesFound: { [key: string]: boolean } = {};
  const givenPaths = handleStringList(args.files);
  for (const globPath of givenPaths) {
    for (const path of glob.sync(globPath)) {
      if (!await exists(path)) {
        throw new Error(`cannot find file ${path}`);
      }
      filesFound[globPath] = true;
      const buffer = readFileSync(path);
      const stats = lstatSync(path);
      if (await isBinaryFile(buffer, stats.size)) {
        throw new Error(`file "${path}" is binary`);
      }
      paths.push(path);
      files.push(buffer);
    }
  }
  const notFound: string[] = [];
  for (const path of givenPaths) {
    if (!(path in filesFound)) {
      notFound.push(path);
    }
  }
  if (notFound.length > 0) {
    throw new Error(`cannot find files ${notFound.join(', ')}`);
  }
  console.log('start indexing');
  await indexFiles(paths, files, args.branch);
  console.log('done indexing files');
};
