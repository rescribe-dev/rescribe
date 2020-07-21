import { renderHeader, renderQuery, userAgentHeader, originalUserAgentHeader } from './shared/headers';
import isBot from 'isbot';
import { CloudFrontRequestHandler } from 'aws-lambda';
import { getPathData, absolutePath } from './shared/regex';

export const handler: CloudFrontRequestHandler = (event, _context, callback) => {
  const request = event.Records[0].cf.request;

  if (userAgentHeader in request.headers) {
    const userAgent = request.headers[userAgentHeader][0].value;
    request.headers[originalUserAgentHeader] = [{
      key: originalUserAgentHeader,
      value: userAgent
    }];
    const query = request.querystring.length > 0 ? '?' + request.querystring : '';
    const pathData = getPathData(request.uri + query);

    // only do prerender if not an absolute path request
    if (!pathData.pathname.match(absolutePath)) {
      if (pathData.searchParams.has(renderQuery)) {
        request.headers[renderHeader] = [{
          key: renderHeader,
          value: pathData.searchParams.get(renderQuery) as string
        }];
      } else if (isBot(userAgent)) {
        request.headers[renderHeader] = [{ key: renderHeader, value: '' }];
      }
    }
  }

  callback(null, request);
};
