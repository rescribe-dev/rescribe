import { CloudFrontRequestHandler } from 'aws-lambda';

const encodingHeader = 'accept-encoding';

const regexSuffixless = /\/[^/.]+$/; // e.g. "/some/page" but not "/", "/some/" or "/some.jpg"
const regexTrailingSlash = /.+\/$/; // e.g. "/some/" or "/some/page/" but not root "/"

export const handler: CloudFrontRequestHandler = (event, _context, callback) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;

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

  // Append ".html" to origin request
	if (request.uri.match(regexSuffixless)) {
		request.uri = request.uri + '.html';
		callback(null, request);
		return;
	}
	// Append "index.html" to origin request
	if (request.uri.match(regexTrailingSlash)) {
		request.uri = request.uri + 'index.html';
		callback(null, request);
		return;
	}

  callback(null, request);
};
