import { botHeader } from './shared/headers';
import isBot from 'isbot';
import { CloudFrontResponseHandler } from 'aws-lambda';

const userAgentHeader = 'user-agent';

export const handler: CloudFrontResponseHandler = (event, _context, callback) => {
  const response = event.Records[0].cf.response;

  const userAgent = response.headers[userAgentHeader][0].value;
  if (isBot(userAgent)) {
    response.headers[botHeader] = [{ key: botHeader, value: 'true' }];
  }

  callback(null, response);
};
