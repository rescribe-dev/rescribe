import { Request, Response } from 'express';
import statusCodes from 'http-status-codes';
import { reverse, lookup } from 'dns';
import isBot from 'isbot';
import { promisify } from 'util';
import { isProduction } from '../utils/mode';
import { s3Client } from '../utils/aws';
import { configData } from '../utils/config';

const reverseLookup = promisify(reverse);
const forwardLookup = promisify(lookup);

const encodingHeader = 'accept-encoding';
const userAgentHeader = 'user-agent';
const overrideUserAgentHeader = 'x-user-agent';

const userAgentHeaders = [overrideUserAgentHeader, userAgentHeader];

const supportedBots: { name: string, hostname: RegExp }[] = [
  {
    name: 'google',
    hostname: /^.*googlebot.com$/
  }
];

export const getSitemap = async (req: Request, res: Response): Promise<void> => {
  try {
    const foundUserAgentHeaders: string[] = [];
    for (const header of userAgentHeaders) {
      if (header in req.headers) {
        foundUserAgentHeaders.push(header);
      }
    }
    if (foundUserAgentHeaders.length === 0) {
      throw new Error('cannot find user agent');
    }
    const userAgent = (req.headers[foundUserAgentHeaders[0]] as string).toLowerCase();
    if (!isBot(userAgent)) {
      throw new Error('user is not a bot');
    }
    if (isProduction()) {
      let foundBot = false;
      const requestIP = req.ip;
      for (const bot of supportedBots) {
        if (userAgent.includes(bot.name)) {
          let hostname: string | undefined = undefined;
          for (const address of await reverseLookup(requestIP)) {
            if (bot.hostname.test(address)) {
              hostname = address;
              break;
            }
          }
          if (!hostname) {
            throw new Error(`no valid hostname for ${bot.name} found`);
          }
          const forwardAddress = await forwardLookup(hostname);
          if (forwardAddress.address !== requestIP) {
            throw new Error('forward and reverse dns lookup ip addresses do not match');
          }
          foundBot = true;
          break;
        }
      }
      if (!foundBot) {
        throw new Error('invalid bot');
      }
    }
    let encodingPath = 'none';
    const headerVal = req.headers[encodingHeader] as string;
    if (headerVal) {
      if (headerVal.includes('br')) {
        encodingPath = 'brotli';
      } else if (headerVal.includes('gzip')) {
        encodingPath = 'gzip';
      }
    }
    const key = encodingPath + req.path;
    const s3Metadata = await s3Client.headObject({
      Bucket: configData.AWS_S3_BUCKET_SITEMAP,
      Key: key
    }).promise();
    res.setHeader('Content-Type', s3Metadata.ContentType as string);
    res.setHeader('Content-Encoding', s3Metadata.ContentEncoding as string);
    res.setHeader('Content-Length', s3Metadata.ContentLength as number);
    res.setHeader('Last-Modified', (s3Metadata.LastModified as Date).getTime());
    const s3File = await s3Client.getObject({
      Bucket: configData.AWS_S3_BUCKET_SITEMAP,
      Key: key
    }).promise();
    if (!s3File.Body) {
      throw new Error(`no body for file ${key}`);
    }
    const s3FileStream = s3Client.getObject({
      Bucket: configData.AWS_S3_BUCKET_SITEMAP,
      Key: key
    }).createReadStream();
    s3FileStream.on('error', err => {
      throw err;
    });
    s3FileStream.pipe(res);
  } catch (err) {
    const errObj = err as Error;
    res.status(statusCodes.UNAUTHORIZED).json({
      message: errObj.message
    });
  }
};
