import fs, { readFileSync, lstatSync } from 'fs';
import { getLogger } from "log4js";
import { handleStringList } from "../utils/cli";
import { isBinaryFile } from "isbinaryfile";
import { promisify } from 'util';
import indexFiles from '../utils/indexFiles';

const logger = getLogger();

const exists = promisify(fs.exists);

export default async (pathsStr: string): Promise<void> => {
  const paths = handleStringList(pathsStr);
  const files: Buffer[] = [];
  for (let i = 0; i < paths.length; i++) {
    const currentIndex = i;
    const path = paths[currentIndex];
    logger.info(`index file "${path}"`);
    if (!await exists(path)) {
      throw new Error(`cannot find file ${path}`);
    }
    const buffer = readFileSync(path);
    const stats = lstatSync(path);
    if (await isBinaryFile(buffer, stats.size)) {
      throw new Error(`file "${path}" is binary`);
    }
    files.push(buffer);
  }
  await indexFiles(paths, files);
};
