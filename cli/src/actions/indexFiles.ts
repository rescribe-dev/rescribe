import fs, { readFileSync, lstatSync } from 'fs';
import { handleStringList } from '../utils/cli';
import { isBinaryFile } from 'isbinaryfile';
import { promisify } from 'util';
import indexFiles from '../utils/indexFiles';
import { Arguments } from 'yargs';
import { cacheData } from '../utils/config';
import glob from 'glob';

const exists = promisify(fs.exists);

interface Args {
  files: string;
  branch: string;
}

export default async (args: Arguments<Args>): Promise<void> => {
  if (cacheData.project.length === 0 || cacheData.repository.length === 0) {
    throw new Error('project and repository need to be set with <set-project>');
  }
  const files: Buffer[] = [];
  const paths: string[] = [];
  for(const globPath of handleStringList(args.files)) {
    for (const path of glob.sync(globPath)) {
      if (!await exists(path)) {
        throw new Error(`cannot find file ${path}`);
      }
      const buffer = readFileSync(path);
      const stats = lstatSync(path);
      if (await isBinaryFile(buffer, stats.size)) {
        throw new Error(`file "${path}" is binary`);
      }
      paths.push(path);
      files.push(buffer);
    }
  }
  await indexFiles(paths, files, args.branch);
  console.log('done indexing files');
};
