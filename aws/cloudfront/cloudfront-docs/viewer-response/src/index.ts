import { CloudFrontResponseHandler } from 'aws-lambda';

export const handler: CloudFrontResponseHandler = (event, _context, callback) => {
  const request = event.Records[0].cf.request;
  const response = event.Records[0].cf.response;
  const headers = response.headers;

  headers['strict-transport-security'] = [{
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubdomains; preload'
  }];
  headers['x-content-type-options'] = [{
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }];
  headers['x-frame-options'] = [{
    key: 'X-Frame-Options',
    value: 'DENY'
  }];
  headers['x-xss-protection'] = [{
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  }];
  headers['referrer-policy'] = [{
    key: 'Referrer-Policy',
    value: 'same-origin'
  }];

  let cacheTime = 21536000;
  const endingMatches = request.uri.match(/\.[0-9a-z]+$/i);
  if (endingMatches && endingMatches.length > 0) {
    switch (endingMatches[0]) {
      case '.js':
        cacheTime = 31536000;
        break;
      case '.css':
        cacheTime = 31536000;
        break;
      default:
        break;
    }
  }

  headers['cache-control'] = [{
    key: 'cache-control',
    value: `public, max-age=${cacheTime}`
  }];

  headers['vary'] = [{
    key: 'vary',
    value: 'accept-encoding'
  }];

  callback(null, response);
};
