'use strict'

// credit to https://medium.com/@felice.geracitano/brotli-compression-delivered-from-aws-7be5b467c2e1
// https://medium.com/@kazaz.or/aws-cloudfront-compression-using-lambda-edge-where-is-brotli-6d296f41f784
// https://github.com/CloudUnder/lambda-edge-nice-urls

const firstLevelRegex = /^\/[^\s\/]+$/; // matches /<>

const secondLevelRegex = /^\/[^\s\/]+\/[^\s\/]+$/; // matches /<>/<>

const regex404 = /^\/?404\/?$/;

const firstLevelRoutes = [
  '/', '/account', '/login', '/register', '/search', '/404'
];

const defaultFirstLevelRoute = '/:username/index.html';

const secondLevelRoutes = [
	{
		regex: /^\/project\/[^\s\/]+[\/]{0,1}$/, // matches /project/<>
		value: '/project/:projectName/index.html'
	}
];

const defaultSecondLevelRoute = '/:username/:repositoryName/index.html';

const firstOrSecondLevel = (uri) => {
  if(uri.match(firstLevelRegex) && firstLevelRoutes.includes(uri)) {
    return true;
  } 
  
  else if (uri.match(secondLevelRegex) && secondLevelRoutes.includes(uri)) {
    return false;
  } 
  
  else {
    return null;
  }
}

exports.handler = (event, _context, callback) => {
    // Redirect (301) non-root requests ending in "/" to URI without trailing slash
	if (request.uri.match(/.+\/$/)) {
		const response = {
			// body: '',
			// bodyEncoding: 'text',
			headers: {
				'location': [{
					key: 'Location',
					value: request.uri.slice(0, -1)
				 }]
			},
			status: '301',
			statusDescription: 'Moved Permanently'
		}
		callback(null, response)
		return
	}
  const request = event.Records[0].cf.request
  const headers = request.headers
	const useBrotli = headers['accept-encoding'] && headers['accept-encoding'][0].value.indexOf('br') > -1
	const originalRequestURI = request.uri;
  const encodingComponent = (useBrotli ? '/brotli' : '/gzip');
  //we dont need to match a regex for first level if all we are going to do is see if it is included within the first level routes list

  if(originalRequestURI.match(regex404)) {
    request.uri = '/404.html'
    callback(null, request)
    return
  }

  const first = firstOrSecondLevel(originalRequestURI)
  if(first === null) {
    request.uri = encodingComponent + defaultFirstLevelRoute;
  } 
  
  else if(first) {
    request.uri = request.uri + '/index.html'
  } 
  
  else {
    for (const elem of secondLevelRoutes) {
      if (originalRequestURI.match(elem.regex)) {
        request.uri = encodingComponent + elem.value;
        callback(null, request)
        return
      }
    }
    request.uri = encodingComponent + defaultSecondLevelRoute;
    callback(null, request)
    return
  }

  callback(null, request)
  return
}

/*
exports.handler = (event, _context, callback) => {
  // Redirect (301) non-root requests ending in "/" to URI without trailing slash
	if (request.uri.match(/.+\/$/)) {
		const response = {
			// body: '',
			// bodyEncoding: 'text',
			headers: {
				'location': [{
					key: 'Location',
					value: request.uri.slice(0, -1)
				 }]
			},
			status: '301',
			statusDescription: 'Moved Permanently'
		}
		callback(null, response)
		return
	}
  const request = event.Records[0].cf.request
  const headers = request.headers
	const useBrotli = headers['accept-encoding'] && headers['accept-encoding'][0].value.indexOf('br') > -1
	const originalRequestURI = request.uri;
	const encodingComponent = (useBrotli ? '/brotli' : '/gzip');
  if (originalRequestURI.match(firstLevelRegex)) {
    if (firstLevelRoutes.includes(request.uri)) {
      if (nonIndexFolders.includes(originalRequestURI)) {
        request.uri = request.uri + '.html'
      } else {
        request.uri = request.uri + '/index.html'
      }
    } else {
      request.uri = encodingComponent + defaultFirstLevelRoute;
    }
    callback(null, request)
    return
  }
  if (originalRequestURI.match(secondLevelRegex)) {
    for (const elem of secondLevelRoutes) {
      if (originalRequestURI.match(elem.regex)) {
        request.uri = encodingComponent + elem.value;
        callback(null, request)
        return
      }
    }
    request.uri = encodingComponent + defaultSecondLevelRoute;
    callback(null, request)
    return
  }
  callback(null, request)
}
*/
