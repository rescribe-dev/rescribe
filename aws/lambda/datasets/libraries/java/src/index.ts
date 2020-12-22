import { EventBridgeHandler } from 'aws-lambda';
import AWS from 'aws-sdk';
import { getLogger } from 'log4js';
import { dataFolder, initializeConfig, repositoryURL } from './utils/config';
import { initializeLogger } from './shared/logger';
import axios from 'axios';
import statusCodes from 'http-status-codes';
import { baseFolder, s3Bucket, saveLocal, paginationSize } from './shared/libraries_global_config';
import YAML from 'yaml';
import cheerio from 'cheerio';
import { writeFileSync } from 'fs';

const logger = getLogger();

const s3Client = new AWS.S3();

const localDataFolder = 'data';

const writeDataS3 = async (basename: string, content: string): Promise<void> => {
  logger.info(`write data to s3: ${basename}`);
  const fileType = 'application/x-yaml';
  if (saveLocal) {
    writeFileSync(`${localDataFolder}/${basename}`, content);
  }
  await s3Client.upload({
    Bucket: s3Bucket,
    Body: content,
    Key: `${baseFolder}/${dataFolder}/${basename}`,
    ContentEncoding: 'identity',
    ContentType: fileType
  })
    .on('httpUploadProgress', (evt) => {
      logger.info(evt);
    })
    .promise();
};

interface LibraryData {
  id: string[];
  versions: string[];
}

interface PageData {
  paths: string[][];
  libraries: LibraryData[];
}

const getData = async (currentPath: string[]): Promise<PageData> => {
  const baseURL = new URL(repositoryURL);
  const fullPath = `${baseURL.pathname}/${currentPath.join('/')}`;
  const currentURL = new URL(fullPath, repositoryURL);
  const res = await axios.get<string>(currentURL.href);
  if (res.status !== statusCodes.OK) {
    throw new Error('problem with getting data');
  }
  const $ = cheerio.load(res.data);
  let paths: string[] = [];
  let library: LibraryData | undefined = undefined;
  $('a').each((_, elem) => {
    let link = $(elem).attr('href');
    if (!link) {
      return;
    }
    link = link.trim();
    if (link.startsWith('.') || !link.endsWith('/')) {
      return;
    }
    // remove the backslash
    link = link.slice(0, -1);
    if (link.length === 0) {
      return;
    }
    if (link.match(/^\d/)) {
      // found a version. ignore path data
      if (library === undefined) {
        library = {
          id: currentPath,
          versions: []
        };
      }
      library.versions.push(link);
    } else {
      paths.push(link);
    }
  });
  const libraries: LibraryData[] = [];
  let fullPaths: string[][] = [];
  if (library !== undefined) {
    libraries.push(library);
    paths = [];
  } else {
    paths = paths.sort().reverse();
    fullPaths = paths.map(path => {
      const current = [...currentPath];
      current.push(path);
      return current;
    });
  }
  const data: PageData = {
    libraries,
    paths: fullPaths
  };
  return data;
};

const writeDatasetRecursive = async (): Promise<void> => {
  let pathsToCheck: string[][] = [[]];
  let allData: LibraryData[] = [];
  let currentPage = 1;
  while (pathsToCheck.length > 0) {
    const currentPath = pathsToCheck.pop();
    if (!currentPath) {
      break;
    }
    const currentData = await getData(currentPath);
    pathsToCheck = pathsToCheck.concat(currentData.paths);
    allData = allData.concat(currentData.libraries);
    while (allData.length >= paginationSize) {
      await writeDataS3(`${currentPage}.yml`, YAML.stringify(allData.slice(0, paginationSize)));
      allData = allData.slice(paginationSize);
      currentPage++;
    }
  }
  if (allData.length > 0) {
    await writeDataS3(`${currentPage}.yml`, YAML.stringify(allData));
  }
  logger.info('done with getting datasets');
};

export const handler: EventBridgeHandler<string, null, void> = async (_event, _context, callback): Promise<void> => {
  await initializeConfig(false);
  initializeLogger();
  await writeDatasetRecursive();
  callback();
  process.exit(0);
};

const getDataset = async (): Promise<void> => {
  await initializeConfig(true);
  initializeLogger();
  await writeDatasetRecursive();
};

if (require.main === module) {
  getDataset().then(() => {
    logger.info('done with update');
    process.exit(0);
  }).catch((err: Error) => {
    console.error(err.message);
    process.exit(1);
  });
}

export default getDataset;
