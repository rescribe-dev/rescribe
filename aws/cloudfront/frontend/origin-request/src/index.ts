import { parseHeadersFile, renderHeader } from './shared/headers';
import { absolutePath, getPathData } from './shared/regex';
import { pathToRegexp } from 'path-to-regexp';
import { CloudFrontRequestHandler } from 'aws-lambda';
import { sitemapPaths } from './sitemaps';

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
let apiURL = 'api.rescribe.dev';
let defaultBucket = 'rescribe-frontend.s3.us-east-1.amazonaws.com';

const cacheControlHeader = 'cache-control';

const processEnvironment = (): void => {
  const useSecureStr = process.env.USE_SECURE;
  if (useSecureStr) {
    useSecure = useSecureStr === 'true';
  }
  const prerenderURLStr = process.env.PRERENDER_URL;
  if (prerenderURLStr !== undefined) {
    prerenderURL = prerenderURLStr;
  }
  const apiURLStr = process.env.API_URL;
  if (apiURLStr !== undefined) {
    apiURL = apiURLStr;
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

  const query = request.querystring.length > 0 ? '?' + request.querystring : '';
  const currentPathData = getPathData(request.uri + query);
  console.log(currentPathData);
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

  const headers = request.headers;

  if (renderHeader in headers && headers[renderHeader].length > 0
    && headers[renderHeader][0].value.length > 0) {
    request.origin = {
      custom: {
        customHeaders: {},
        domainName: prerenderURL,
        keepaliveTimeout: 5,
        path: '',
        port: useSecure ? 443 : 80,
        protocol: useSecure ? 'https' : 'http',
        readTimeout: 5,
        sslProtocols: ['TLSv1', 'TLSv1.1']
      },
      s3: undefined
    };
    request.headers['host'] = [ { key: 'host', value: prerenderURL } ];
    request.headers[cacheControlHeader] = [ { key: cacheControlHeader, value: 'no-cache' } ];
    callback(null, request);
    return;
  }

  if (sitemapPaths.includes(path)) {
    request.origin = {
      custom: {
        customHeaders: {},
        domainName: apiURL,
        keepaliveTimeout: 5,
        path: '',
        port: useSecure ? 443 : 80,
        protocol: useSecure ? 'https' : 'http',
        readTimeout: 5,
        sslProtocols: ['TLSv1', 'TLSv1.1']
      },
      s3: undefined
    };
    request.headers['host'] = [ { key: 'host', value: apiURL } ];
    request.headers[cacheControlHeader] = [ { key: cacheControlHeader, value: 'no-cache' } ];
    callback(null, request);
    return;
  }

  if (!path.match(absolutePath)) {
    // change to be an absolute path
    const matches: PathData[] = [];
    for (const pathData of paths) {
      if (path.match(pathData.regex)) {
        matches.push(pathData);
      }
    }
    if (matches.length === 0) {
      request.uri = errorPage;
    } else {
      matches.sort((a, b) => numWildcards(a.path) - numWildcards(b.path));
      request.uri = matches[0].path;
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

  callback(null, request);
};
