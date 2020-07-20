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

const logger = getLogger();

const brotliCompressPromise = promisify(brotliCompress);
const gzipCompressPromise = promisify(gzip);

const defaultBase = 'none';
const gzipBase = 'gzip';
const brotliBase = 'brotli';

const changeFrequency = 'daily';
const priority = 0.7;

const s3Client = new AWS.S3();

const writeSitemap = async (name: string, content: string): Promise<void> => {
  const fileType = 'application/xml';
  await s3Client.upload({
    Bucket: s3Bucket,
    Body: content,
    Key: `${defaultBase}/${name}`,
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
    Key: `${gzipBase}/${name}`,
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
    Key: `${brotliBase}/${name}`,
    ContentEncoding: 'br',
    ContentType: fileType
  })
    .on('httpUploadProgress', (evt) => {
      logger.info(evt);
    })
    .promise();
};

const createSitemap = (paths: string[]): string => {
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
  return xmlFile.end();
};

const createSitemapIndex = (paths: string[]): string => {
  const xmlFile = xmlBuilder.create('sitemapindex')
    .attribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
  for (const path of paths) {
    const sitemapObj = xmlFile.element('sitemap');
    sitemapObj.element('loc', websiteURL + path);
    sitemapObj.element('lastmod', new Date().getTime());
  }
  return xmlFile.end();
};

const writeAllSitemaps = async (): Promise<void> => {
  logger.info('start db initialize');
  await initializeDB(dbConnectionURI, dbName);
  logger.info('database connection set up');

  const userPaths: string[] = [];
  for (const user of await UserModel.find()) {
    userPaths.push(`/${user.username}`);
  }
  await writeSitemap(sitemapPaths[1].substring(1), createSitemap(userPaths));

  await writeSitemap(sitemapPaths[0].substring(1), createSitemapIndex(sitemapPaths.slice(1)));
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
