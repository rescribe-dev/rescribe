import { parseHeadersFile } from './shared/headers';
import { absolutePath } from './shared/regex';
import { pathToRegexp } from 'path-to-regexp';
import { CloudFrontRequestHandler, CloudFrontHeaders } from 'aws-lambda';

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

const getAllHeaders = (uri: string): CloudFrontHeaders => {
  const headers: CloudFrontHeaders = {};
  const absolute = uri.match(absolutePath);
  for (const elem of headerMap) {
    if (allHeadersPaths.includes(elem.path) || uri === elem.path
      || (!absolute && uri.match(elem.regex))) {
      const headerContent = headerData[elem.path];
      for (const headerKey in headerContent) {
        if (!(headerKey in headers)) {
          headers[headerKey] = [];
        }
        for (const headerVal of headerContent[headerKey]) {
          headers[headerKey].push({
            value: headerVal
          });
        }
      }
    }
  }
  return headers;
};

export const handler: CloudFrontRequestHandler = (event, _context, callback) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;

  const newHeaders = getAllHeaders(request.uri);

  for (const headerKey in newHeaders) {
    if (!(headerKey in headers)) {
      headers[headerKey] = [];
    }
    headers[headerKey].concat(newHeaders[headerKey]);
  }

  callback(null, request);
};
