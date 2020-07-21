import { renderHeader, renderQuery, userAgentHeader, originalUserAgentHeader } from './shared/headers';
import isBot from 'isbot';
import { CloudFrontRequestHandler } from 'aws-lambda';

export const handler: CloudFrontRequestHandler = (event, _context, callback) => {
  const request = event.Records[0].cf.request;

  const searchParams = new URLSearchParams(request.querystring);

  const userAgent = request.headers[userAgentHeader][0].value;
  request.headers[originalUserAgentHeader] = [{ key: originalUserAgentHeader, value: userAgent }];
  if (searchParams.has(renderQuery)) {
    request.headers[renderHeader] = [{ key: renderHeader, value: searchParams.get(renderQuery) as string }];
  } else if (isBot(userAgent)) {
    request.headers[renderHeader] = [{ key: renderHeader, value: '' }];
  }

  callback(null, request);
};
