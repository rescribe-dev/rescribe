import template from './template';
import appFunction from './';
import { createProbot } from 'probot';
import HttpStatus from 'http-status-codes';
import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { appID, webhookSecret, privateKey } from './config';

const lowerCaseKeys = (obj: Record<string, unknown>): Record<string, unknown> =>
  Object.keys(obj).reduce((accumulator, key) =>
    Object.assign(accumulator, { [key.toLocaleLowerCase()]: obj[key] }), {});

interface GithubData {
  action: string;
}

const github: APIGatewayProxyHandler = async (event, context): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === 'GET' && event.path === '/') {
    return {
      statusCode: HttpStatus.OK,
      headers: {
        'Content-Type': 'text/html'
      },
      body: template
    };
  }
  const probot = createProbot({
    id: appID,
    secret: webhookSecret,
    cert: privateKey
  });
  probot.load(appFunction);
  // Ends function immediately after callback
  // context.callbackWaitsForEmptyEventLoop = false;

  // Determine incoming webhook event type
  const headers = lowerCaseKeys(event.headers);
  const e = headers['x-github-event'];

  // If body is expected to be base64 encoded, decode it and continue
  if (event.isBase64Encoded) {
    event.body = Buffer.from(event.body as string, 'base64').toString('utf8');
  }
  let body: GithubData;
  try {
    body = (typeof event.body === 'string') ? JSON.parse(event.body) : event.body;
  } catch(err) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'invalid event body'
      })
    };
  }
  probot.logger.info(`Received event ${e}${body.action ? ('.' + body.action) : ''}`);
  if (event) {
    try {
      await probot.receive({
        id: '',
        name: e as string,
        payload: event.body
      });
      return {
        statusCode: HttpStatus.OK,
        body: JSON.stringify({
          message: `Received ${e}.${body.action}`
        })
      };
    } catch (err) {
      probot.logger.error(err);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        body: JSON.stringify(err)
      };
    }
  } else {
    probot.logger.error({ event, context });
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'unknown error'
      })
    };
  }
};

module.exports.github = github;
