import { ScheduledHandler } from 'aws-lambda';
import AWS from 'aws-sdk';
import { brotliCompress, gzip } from 'zlib';
import { config } from 'dotenv';
import xmlBuilder from 'xmlbuilder';
import { promisify } from 'util';
import { getLogger } from 'log4js';
import { initializeDB } from './shared/db/connect';
import { UserModel } from './shared/schema/auth/user';

const logger = getLogger();

const brotliCompressPromise = promisify(brotliCompress);
const gzipCompressPromise = promisify(gzip);

const defaultBase = 'none';
const gzipBase = 'gzip';
const brotliBase = 'brotli';

const changeFrequency = 'daily';
const priority = 0.7;

const s3Client = new AWS.S3();

let dbConnectionURI: string;
let s3Bucket = 'rescribe-sitemap';
let dbName = 'rescribe';
let websiteURL = 'https://rescribe.dev';
let apiURL = 'https://api.rescribe.dev';

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
    sitemapObj.element('loc', apiURL + path);
    sitemapObj.element('lastmod', new Date().getTime());
  }
  return xmlFile.end();
};

const usersSitemap = 'sitemap_users.xml';

const sitemaps = [usersSitemap];

const writeAllSitemaps = async (): Promise<void> => {
  logger.info('start db initialize');
  await initializeDB(dbConnectionURI, dbName);
  logger.info('database connection set up');

  const userPaths: string[] = [];
  for (const user of await UserModel.find()) {
    userPaths.push(`/${user.username}`);
  }
  await writeSitemap(usersSitemap, createSitemap(userPaths));

  await writeSitemap('sitemap.xml', createSitemapIndex(sitemaps.map(name => `/${name}`)));
};

export const handler: ScheduledHandler = async (_event, _context, callback) => {
  await writeAllSitemaps();
  callback(null);
};

const runUpdate = async (): Promise<void> => {
  config();
  if (!process.env.DB_CONNECTION_URI) {
    throw new Error('cannot find database uri');
  }
  dbConnectionURI = process.env.DB_CONNECTION_URI;
  if (process.env.DB_NAME) {
    dbName = process.env.DB_NAME;
  }
  if (process.env.WEBSITE_URL) {
    websiteURL = process.env.WEBSITE_URL;
  }
  if (process.env.API_URL) {
    apiURL = process.env.API_URL;
  }
  if (process.env.AWS_S3_BUCKET) {
    s3Bucket = process.env.AWS_S3_BUCKET;
  }
  AWS.config = new AWS.Config();
  if (!process.env.AWS_ACCESS_KEY_ID) {
    throw new Error('no aws access key id provided');
  }
  AWS.config.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('no aws secret access key provided');
  }
  AWS.config.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!process.env.AWS_REGION) {
    throw new Error('no aws region provided');
  }
  AWS.config.region = process.env.AWS_REGION;
  await writeAllSitemaps();
};

if (!module.parent) {
  runUpdate().then(() => {
    logger.info('done with update');
    process.exit(0);
  }).catch((err: Error) => {
    logger.error(err.message);
    process.exit(1);
  });
}

export default runUpdate;
