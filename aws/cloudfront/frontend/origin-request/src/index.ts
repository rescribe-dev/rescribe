import { parseHeadersFile, renderHeader } from './shared/headers';
import { absolutePath, getPath } from './shared/regex';
import { pathToRegexp } from 'path-to-regexp';
import { CloudFrontRequestHandler } from 'aws-lambda';

const errorPage = '/404';

const encodingHeader = 'accept-encoding';

interface PathData {
  path: string;
  regex: RegExp;
}

const relativePathExclude = ['/*', '/static/*'];

const getPaths = (): PathData[] => {
  const headerData = parseHeadersFile();
  const paths: PathData[] = [];
  for (let path in headerData) {
    if (!relativePathExclude.includes(path) && !path.match(absolutePath)) {
      // replace /* with (.*) to work with path-to-regexp
      const regex = pathToRegexp(path.replace('*', '(.*)'));
      if (path[path.length - 1] !== '/') {
        path += '/';
      }
      path += 'index.html';
      paths.push({
        path,
        regex
      });
    }
  }
  return paths;
};

const paths = getPaths();

let useSecure = false;

let prerenderURL = 'rescribe-prerender-load-balancer-1976257869.us-east-1.elb.amazonaws.com';

const processEnvironment = (): void => {
  const useSecureStr = process.env.USE_SECURE;
  if (useSecureStr) {
    useSecure = useSecureStr === 'true';
  }
  const prerenderURLStr = process.env.PRERENDER_URL;
  if (prerenderURLStr !== undefined) {
    prerenderURL = prerenderURLStr;
  }
};

processEnvironment();

export const handler: CloudFrontRequestHandler = (event, _context, callback) => {
  const request = event.Records[0].cf.request;

  const path = getPath(request.uri);

  // Redirect (301) non-root requests ending in "/" to URI without trailing slash
  if (path.match(/.+\/$/)) {
    const response = {
      headers: {
        'location': [{
          key: 'Location',
          value: request.uri.slice(0, -1)
        }]
      },
      status: '301',
      statusDescription: 'Moved Permanently'
    };
    callback(null, response);
    return;
  }

  const headers = request.headers;

  if (renderHeader in headers && headers[renderHeader].length > 0
    && headers[renderHeader][0].value.length > 0) {
    request.origin = {
      custom: {
        customHeaders: {},
        domainName: prerenderURL,
        keepaliveTimeout: 5,
        path: request.uri + `?render=${headers[renderHeader][0].value}`,
        port: useSecure ? 443 : 80,
        protocol: useSecure ? 'https' : 'http',
        readTimeout: 5,
        sslProtocols: ['TLSv1', 'TLSv1.1']
      },
      s3: undefined
    };
    callback(null, request);
    return;
  }

  if (!path.match(absolutePath)) {
    // change to be an absolute path
    let foundPage = false;
    for (const pathData of paths) {
      if (path.match(pathData.regex)) {
        request.uri = pathData.path;
        foundPage = true;
        break;
      }
    }
    if (!foundPage) {
      request.uri = errorPage;
    }
  }

  let encodingPath = '/none';

  if (encodingHeader in headers) {
    const headerVal = headers[encodingHeader][0].value;
    if (headerVal.includes('br')) {
      encodingPath = '/brotli';
    } else if (headerVal.includes('gzip')) {
      encodingPath = '/gzip';
    }
  }

  request.uri = encodingPath + request.uri;

  callback(null, request);
};
