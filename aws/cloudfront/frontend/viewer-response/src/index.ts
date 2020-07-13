import { parseHeadersFile, invalidHeaderPrefixes, invalidHeaders } from './shared/headers';
import { absolutePath, getPathData, getEnding } from './shared/regex';
import { pathToRegexp } from 'path-to-regexp';
import { CloudFrontResponseHandler, CloudFrontHeaders } from 'aws-lambda';

const headerData = parseHeadersFile();
const headerMap: { regex: RegExp, path: string }[] = [];

const getHeaderMap = (): void => {
  for (const path in headerData) {
    // replace /* with (.*) to work with path-to-regexp
    const regex = pathToRegexp(path.replace('*', '(.*)'));
    headerMap.push({
      path,
      regex
    });
  }
};

getHeaderMap();

const allHeadersPaths = ['/*'];

// from https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-requirements-limits.html
const restrictedHeaders = ['Content-Encoding', 'Content-Length', 'Transfer-Encoding', 'Warning', 'Via'];

const getAllHeaders = (path: string): CloudFrontHeaders => {
  const newHeaders: CloudFrontHeaders = {};
  const absolute = path.match(absolutePath);
  for (const elem of headerMap) {
    if (allHeadersPaths.includes(elem.path) || path === elem.path
      || (!absolute && path.match(elem.regex))) {
      const headerContent = headerData[elem.path];
      for (const headerKey in headerContent) {
        if (restrictedHeaders.includes(headerKey) ||
          invalidHeaders.includes(headerKey) ||
          invalidHeaderPrefixes.findIndex(prefix => headerKey.startsWith(prefix)) >= 0) {
          continue;
        }
        if (!(headerKey in newHeaders)) {
          newHeaders[headerKey] = [];
        }
        for (const headerVal of headerContent[headerKey]) {
          newHeaders[headerKey].push({
            value: headerVal
          });
        }
      }
    }
  }
  return newHeaders;
};

const cacheControlHeader = 'cache-control';
const stsHeader = 'strict-transport-security';
const ctoHeader = 'x-content-type-options';
const xfoHeader = 'x-frame-options';
const xssHeader = 'x-xss-protection';
const referrerHeader = 'referrer-policy';
const varyHeader = 'vary';

export const handler: CloudFrontResponseHandler = (event, _context, callback) => {
  const request = event.Records[0].cf.request;
  const response = event.Records[0].cf.response;
  const headers = response.headers;

  const pathData = getPathData(request.uri);
  const newHeaders = getAllHeaders(pathData.pathname);

  for (const headerKey in newHeaders) {
    if (!(headerKey in headers)) {
      headers[headerKey] = [];
    }
    headers[headerKey].concat(newHeaders[headerKey]);
  }

  if (!(cacheControlHeader in headers)) {
    let cacheTime = 21536000;
    const endingMatches = request.uri.match(getEnding);
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
    headers[cacheControlHeader] = [{
      key: cacheControlHeader,
      value: `public, max-age=${cacheTime}`
    }];
  }

  if (!(stsHeader in headers)) {
    headers[stsHeader] = [{
      key: stsHeader,
      value: 'max-age=31536000; includeSubdomains; preload'
    }];
  }
  if (!(ctoHeader in headers)) {
    headers[ctoHeader] = [{
      key: ctoHeader,
      value: 'nosniff'
    }];
  }
  if (!(xfoHeader in headers)) {
    headers[xfoHeader] = [{
      key: xfoHeader,
      value: 'DENY'
    }];
  }
  if (!(xssHeader in headers)) {
    headers[xssHeader] = [{
      key: xssHeader,
      value: '1; mode=block'
    }];
  }
  if (!(referrerHeader in headers)) {
    headers[referrerHeader] = [{
      key: referrerHeader,
      value: 'same-origin'
    }];
  }
  if (!(varyHeader in headers)) {
    headers[varyHeader] = [{
      key: varyHeader,
      value: 'accept-encoding'
    }];
  }

  callback(null, response);
};
