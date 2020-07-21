import { EventBridgeHandler } from 'aws-lambda';
import AWS from 'aws-sdk';
import { brotliCompress, gzip } from 'zlib';
import xmlBuilder from 'xmlbuilder';
import { promisify } from 'util';
import { getLogger } from 'log4js';
import { initializeDB } from './shared/db/connect';
import { UserModel } from './shared/schema/auth/user';
import { initializeConfig, s3Bucket, websiteURL, dbConnectionURI, dbName } from './utils/config';
import { initializeLogger } from './utils/logger';
import { sitemapPaths } from './shared/sitemaps';
import { createHash } from 'crypto';
import axios from 'axios';
import { OK } from 'http-status-codes';
import { SitemapModel, Sitemap } from './shared/schema/utils/sitemap';

const logger = getLogger();

const brotliCompressPromise = promisify(brotliCompress);
const gzipCompressPromise = promisify(gzip);

const defaultBase = 'none';
const gzipBase = 'gzip';
const brotliBase = 'brotli';

const changeFrequency = 'daily';
const priority = 0.7;

const s3Client = new AWS.S3();

const writeSitemapS3 = async (sitemapName: string, content: string): Promise<void> => {
  const fileType = 'application/xml';
  await s3Client.upload({
    Bucket: s3Bucket,
    Body: content,
    Key: `${defaultBase}/${sitemapName}`,
    ContentEncoding: 'identity',
    ContentType: fileType
  })
    .on('httpUploadProgress', (evt) => {
      logger.info(evt);
    })
    .promise();
  await s3Client.upload({
    Bucket: s3Bucket,
    Body: await gzipCompressPromise(content) as Buffer,
    Key: `${gzipBase}/${sitemapName}`,
    ContentEncoding: 'gzip',
    ContentType: fileType
  })
    .on('httpUploadProgress', (evt) => {
      logger.info(evt);
    })
    .promise();
  await s3Client.upload({
    Bucket: s3Bucket,
    Body: await brotliCompressPromise(content),
    Key: `${brotliBase}/${sitemapName}`,
    ContentEncoding: 'br',
    ContentType: fileType
  })
    .on('httpUploadProgress', (evt) => {
      logger.info(evt);
    })
    .promise();
};

const createSitemapHash = (data: string): string => {
  return createHash('sha256').update(data).digest('hex');
};

const sendSitemapUpdatePings = async (sitemapPath: string): Promise<void> => {
  const res = await axios.get('https://www.google.com/ping', {
    params: {
      sitemap: websiteURL + sitemapPath
    }
  });
  if (res.status !== OK) {
    throw new Error('problem with google sitemap update ping');
  }
};

interface CreateSitemapOutput {
  lastmod: Date;
  changed: boolean;
}

const writeSitemap = async (sitemapPath: string, data: string): Promise<CreateSitemapOutput> => {
  const sitemapName = sitemapPath.substring(1);
  const newHash = createSitemapHash(data);

  const lastSitemapData = await SitemapModel.findOne({
    name: sitemapName
  });

  let lastmod: Date;
  const changed = !lastSitemapData || lastSitemapData.hash !== newHash;
  if (changed) {
    lastmod = new Date();
    await SitemapModel.updateOne({
      name: sitemapName
    }, {
      $set: {
        lastmod: lastmod.getTime(),
        hash: newHash
      }
    }, {
      upsert: true
    });
    await writeSitemapS3(sitemapName, data);
    await sendSitemapUpdatePings(sitemapPath);
  } else {
    lastmod = new Date((lastSitemapData as Sitemap).lastmod);
  }
  return {
    lastmod,
    changed
  };
};

const createSitemap = async (paths: string[], sitemapPath: string): Promise<CreateSitemapOutput> => {
  const xmlFile = xmlBuilder.create('urlset')
    .attribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    .attribute('xmlns:news', 'http://www.google.com/schemas/sitemap-news/0.9')
    .attribute('xmlns:xhtml', 'http://www.w3.org/1999/xhtml')
    .attribute('xmlns:mobile', 'http://www.google.com/schemas/sitemap-mobile/1.0')
    .attribute('xmlns:image', 'http://www.google.com/schemas/sitemap-image/1.1')
    .attribute('xmlns:video', 'http://www.google.com/schemas/sitemap-video/1.1');
  for (const path of paths) {
    const urlObj = xmlFile.element('url');
    urlObj.element('loc', websiteURL + path);
    urlObj.element('changefreq', changeFrequency);
    urlObj.element('priority', priority);
  }
  const data = xmlFile.end();
  return await writeSitemap(sitemapPath, data);
};

interface SitemapIndexInput {
  path: string;
  lastmod: Date;
}

const createSitemapIndex = async (sitemapPath: string, files: SitemapIndexInput[]):
  Promise<CreateSitemapOutput> => {
  const xmlFile = xmlBuilder.create('sitemapindex')
    .attribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
  for (const fileData of files) {
    const sitemapObj = xmlFile.element('sitemap');
    sitemapObj.element('loc', websiteURL + fileData.path);
    sitemapObj.element('lastmod', fileData.lastmod.getTime());
  }

  const data = xmlFile.end();
  return await writeSitemap(sitemapPath, data);
};

const writeAllSitemaps = async (): Promise<void> => {
  logger.info('start db initialize');
  await initializeDB(dbConnectionURI, dbName);
  logger.info('database connection set up');

  const indexFiles: SitemapIndexInput[] = [];
  let indexChanged = false;

  // handle user sitemap
  const userPaths: string[] = [];
  for (const user of await UserModel.find()) {
    userPaths.push(`/${user.username}`);
  }
  const userFileData = await createSitemap(userPaths, sitemapPaths[1]);
  indexChanged = indexChanged || userFileData.changed;
  indexFiles.push({
    lastmod: userFileData.lastmod,
    path: sitemapPaths[1]
  });

  // handle index sitemap
  if (indexChanged) {
    await createSitemapIndex(sitemapPaths[0], indexFiles);
  }

  logger.info('done with sitemap processing');
};

export const handler: EventBridgeHandler<string, null, void> = async (_event, _context, callback): Promise<void> => {
  await initializeConfig(false);
  initializeLogger();
  await writeAllSitemaps();
  callback();
  process.exit(0);
};

const runUpdate = async (): Promise<void> => {
  await initializeConfig(true);
  initializeLogger();
  await writeAllSitemaps();
};

if (!module.parent) {
  runUpdate().then(() => {
    logger.info('done with update');
    process.exit(0);
  }).catch((err: Error) => {
    console.error(err.message);
    process.exit(1);
  });
}

export default runUpdate;
