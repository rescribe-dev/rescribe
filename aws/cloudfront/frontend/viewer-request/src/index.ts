import { botHeader } from './shared/headers';
import isBot from 'isbot';
import { CloudFrontRequestHandler } from 'aws-lambda';

const userAgentHeader = 'user-agent';

export const handler: CloudFrontRequestHandler = (event, _context, callback) => {
  const request = event.Records[0].cf.request;

  const userAgent = request.headers[userAgentHeader][0].value;
  if (isBot(userAgent)) {
    request.headers[botHeader] = [{ key: botHeader, value: 'true' }];
  }

  callback(null, request);
};
