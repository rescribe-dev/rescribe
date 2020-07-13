import { parseHeadersFile, invalidHeaderPrefixes, invalidHeaders } from './shared/headers';
import { absolutePath, getPathData } from './shared/regex';
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

export const handler: CloudFrontResponseHandler = (event, _context, callback) => {
  const request = event.Records[0].cf.request;
  const response = event.Records[0].cf.response;
  const originalHeaders = response.headers;

  const pathData = getPathData(request.uri);
  const newHeaders = getAllHeaders(pathData.pathname);

  for (const headerKey in newHeaders) {
    if (!(headerKey in originalHeaders)) {
      originalHeaders[headerKey] = [];
    }
    originalHeaders[headerKey].concat(newHeaders[headerKey]);
  }

  callback(null, response);
};
