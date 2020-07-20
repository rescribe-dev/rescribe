import { Request, Response } from 'express';
import { UNAUTHORIZED, OK } from 'http-status-codes';
import { reverse, lookup } from 'dns';
import isBot from 'isbot';
import { promisify } from 'util';
import { isProduction } from '../utils/mode';
import { s3Client } from '../utils/aws';
import { configData } from '../utils/config';

const reverseLookup = promisify(reverse);
const forwardLookup = promisify(lookup);

const userAgentHeader = 'user-agent';
const encodingHeader = 'accept-encoding';

const supportedBots: { name: string, hostname: RegExp }[] = [
  {
    name: 'google',
    hostname: /^.*googlebot.com$/
  }
];

export const usersSitemap = async (req: Request, res: Response): Promise<void> => {
  try {
    let userAgent = req.headers[userAgentHeader];
    if (!userAgent) {
      throw new Error('cannot find user agent');
    }
    userAgent = userAgent.toLowerCase();
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
    let encodingPath = '/none';
    const headerVal = req.headers[encodingHeader] as string;
    if (headerVal) {
      if (headerVal.includes('br')) {
        encodingPath = '/brotli';
      } else if (headerVal.includes('gzip')) {
        encodingPath = '/gzip';
      }
    }
    const key = encodingPath + req.path;
    const s3File = await s3Client.getObject({
      Bucket: configData.AWS_S3_BUCKET_SITEMAP,
      Key: key
    }).promise();
    if (!s3File.Body) {
      throw new Error(`no body for file ${key}`);
    }
    res.status(OK).write(s3File.Body);
  } catch (err) {
    const errObj = err as Error;
    res.status(UNAUTHORIZED).json({
      message: errObj.message
    });
  }
};
