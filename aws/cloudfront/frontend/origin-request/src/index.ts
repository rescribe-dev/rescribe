import { parseHeadersFile, botHeader } from './shared/headers';
import { absolutePath } from './shared/regex';
import { pathToRegexp } from 'path-to-regexp';
import { CloudFrontRequestHandler } from 'aws-lambda';

const errorPage = '/404';

const encodingHeader = 'accept-encoding';

interface PathData {
  path: string;
  regex: RegExp;
}

const paths: PathData[] = [];

const relativePathExclude = ['/*', '/static/*'];

const getPaths = (): void => {
  const headerData = parseHeadersFile();
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
};

getPaths();

let useSecure = false;

let prerenderURL: string;

const processEnvironment = (): void => {
  const useSecureStr = process.env.USE_SECURE;
  if (useSecureStr) {
    useSecure = useSecureStr === 'true';
  }
  const prerenderURLStr = process.env.PRERENDER_URL;
  if (!prerenderURLStr) {
    throw new Error('cannot find prerender url');
  }
  prerenderURL = prerenderURLStr;
}

processEnvironment();

export const handler: CloudFrontRequestHandler = (event, _context, callback) => {
  const request = event.Records[0].cf.request;

  // Redirect (301) non-root requests ending in "/" to URI without trailing slash
	if (request.uri.match(/.+\/$/)) {
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

  if (!request.uri.match(absolutePath)) {
    // change to be an absolute path
    let foundPage = false;
    for (const pathData of paths) {
      if (request.uri.match(pathData.regex)) {
        request.uri = pathData.path;
        foundPage = true;
        break;
      }
    }
    if (!foundPage) {
      request.uri = errorPage;
    }
  }

  const headers = request.headers;

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

  if (botHeader in headers && headers[botHeader].length > 0 && headers[botHeader][0].value === 'true') {
    const url = new URL(request.uri);
    url.protocol = useSecure ? 'https' : 'http';
    url.hostname = prerenderURL;
    url.port = useSecure ? '443' : '80';
    request.uri = url.toString();
  }

  callback(null, request);
};
