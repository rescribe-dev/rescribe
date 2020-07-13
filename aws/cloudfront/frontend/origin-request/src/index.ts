import { parseHeadersFile, renderHeader } from './shared/headers';
import { absolutePath, getPathData } from './shared/regex';
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

let useSecure = true;

let prerenderURL = 'prerender.rescribe.dev';
let defaultBucket = 'rescribe-frontend.s3.us-east-1.amazonaws.com';

const processEnvironment = (): void => {
  const useSecureStr = process.env.USE_SECURE;
  if (useSecureStr) {
    useSecure = useSecureStr === 'true';
  }
  const prerenderURLStr = process.env.PRERENDER_URL;
  if (prerenderURLStr !== undefined) {
    prerenderURL = prerenderURLStr;
  }
  const defaultBucketStr = process.env.DEFAULT_BUCKET;
  if (defaultBucketStr !== undefined) {
    defaultBucket = defaultBucketStr;
  }
};

processEnvironment();

const numWildcards = (path: string) => {
  return path.split(':').length - 1;
};

export const handler: CloudFrontRequestHandler = (event, _context, callback) => {
  const request = event.Records[0].cf.request;

  const currentPathData = getPathData(request.uri);
  const path = currentPathData.pathname;
  const search = currentPathData.search;

  // Redirect (301) non-root requests ending in "/" to URI without trailing slash
  if (path.match(/.+\/$/)) {
    const response = {
      headers: {
        'location': [{
          key: 'Location',
          value: path.slice(0, -1) + search
        }]
      },
      status: '301',
      statusDescription: 'Moved Permanently'
    };
    callback(null, response);
    return;
  }

  request.uri = '';

  const headers = request.headers;

  if (renderHeader in headers && headers[renderHeader].length > 0
    && headers[renderHeader][0].value.length > 0) {
    request.origin = {
      custom: {
        customHeaders: {},
        domainName: prerenderURL,
        keepaliveTimeout: 5,
        path: path + search,
        port: useSecure ? 443 : 80,
        protocol: useSecure ? 'https' : 'http',
        readTimeout: 5,
        sslProtocols: ['TLSv1', 'TLSv1.1']
      },
      s3: undefined
    };
    request.headers['host'] = [ { key: 'host', value: prerenderURL } ];
    callback(null, request);
    return;
  }

  let fullPath = path;

  if (!path.match(absolutePath)) {
    // change to be an absolute path
    const matches: PathData[] = [];
    for (const pathData of paths) {
      if (path.match(pathData.regex)) {
        matches.push(pathData);
      }
    }
    if (matches.length === 0) {
      fullPath = errorPage;
    } else {
      matches.sort((a, b) => numWildcards(a.path) - numWildcards(b.path));
      fullPath = matches[0].path;
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

  fullPath = encodingPath + fullPath;

  request.origin = {
    custom: undefined,
    s3: {
      authMethod: 'none',
      customHeaders: {},
      domainName: defaultBucket,
      path: '',
      region: 'us-east-1'
    }
  };
  request.headers['host'] = [ { key: 'host', value: defaultBucket } ];

  request.uri = fullPath;

  callback(null, request);
};
