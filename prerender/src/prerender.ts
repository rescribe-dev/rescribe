import { Request, Response } from 'express';
import { Page, Viewport } from 'puppeteer';
import { parse } from 'url';
import { getLogger } from 'log4js';
import { NOT_FOUND, OK } from 'http-status-codes';
import { webClient } from './utils/webBridge';
import { extension } from 'mime-types';
import { AxiosError, AxiosResponse } from 'axios';
import { browser } from './utils/puppet';

const logger = getLogger();

const forceRenderQuery = '_render';

const renderHeader = 'x-render';

const widthQuery = '_width';
const heightQuery = '_height';
const mobileQuery = '_mobile';

const contentTypeHeader = 'content-type';

const renderTimeSeconds = 1;

const sendAxiosResponse = (axiosRes: AxiosResponse, res: Response, content?: any): void => {
  for (const header in axiosRes.headers) {
    res.setHeader(header, axiosRes.headers[header]);
  }
  if (!content) {
    content = axiosRes.data;
  }
  res.status(axiosRes.status).send(content);
};

enum RenderType {
  html = 'html',
  png = 'png',
  pdf = 'pdf',
  jpg = 'jpg'
}
const defaultRenderType = RenderType.html;
const windowsizeRenderTypes = [RenderType.jpg, RenderType.png, RenderType.pdf];

const defaultViewport: Viewport = {
  width: 1920,
  height: 1080,
  isMobile: false
};

const getQueryParm = (req: Request, key: string): string => {
  if (key in req.query) {
    const currentQuery = req.query[key] as string;
    return currentQuery;
  }
  return '';
};

const getIntegerQuery = (key: string, value: string): number => {
  const cast = Number(value);
  if (isNaN(cast)) {
    throw new Error(`non-numeric query param ${value} provided for ${key}`);
  }
  if (!Number.isInteger(cast)) {
    throw new Error(`non-integer query param ${value} provided for ${key}`);
  }
  return cast;
};

const prerender = async (req: Request, res: Response): Promise<void> => {
  const url = parse(req.url);
  let queryStr = '';
  if (url.query) {
    const query = new URLSearchParams(url.query ? Object.assign('', url.search) : undefined);
    query.delete(forceRenderQuery);
    const queryStrData = query.toString();
    if (queryStrData.length > 0) {
      queryStr = '?' + queryStrData;
    }
  }
  const proxiedURL = (url.path ? url.pathname : '') + queryStr;
  let requestResponse: AxiosResponse | undefined = undefined;

  const mustRender = forceRenderQuery in req.query;
  let renderType = defaultRenderType;
  const viewPort: Viewport = {
    ...defaultViewport
  };

  try {
    const renderTypeParam = getQueryParm(req, forceRenderQuery);
    if (mustRender && renderTypeParam.length > 0) {
      if (!(<any>Object).values(RenderType).includes(renderTypeParam)) {
        throw new Error(`invalid render type ${renderTypeParam} provided`);
      }
      renderType = renderTypeParam as RenderType;
      if (windowsizeRenderTypes.includes(renderType)) {
        if (widthQuery in req.query) {
          const widthQueryParam = getQueryParm(req, widthQuery);
          if (widthQueryParam.length > 0) {
            viewPort.width = getIntegerQuery(widthQuery, widthQueryParam);
          }
        }
        if (heightQuery in req.query) {
          const heightQueryParam = getQueryParm(req, heightQuery);
          if (heightQueryParam.length > 0) {
            viewPort.height = getIntegerQuery(heightQuery, heightQueryParam);
          }
        }
        if (mobileQuery in req.query) {
          viewPort.isMobile = true;
        }
      }
    }
    delete req.headers.host;
    delete req.headers[renderHeader];
    req.headers['cache-control'] = 'no-cache';
    delete req.headers['accept-encoding'];
    if (mustRender && req.headers.accept) {
      delete req.headers.accept;
    }
    requestResponse = await webClient.get(webClient.defaults.baseURL + proxiedURL, {
      headers: req.headers
    });
    if (!requestResponse) return;
    if (!(contentTypeHeader in requestResponse.headers)) {
      throw new Error('cannot find content type header in response');
    }
    const rawContentType = requestResponse.headers[contentTypeHeader];
    const type = extension(rawContentType);
    if (!type) {
      throw new Error('invalid content type');
    }
    if (mustRender && type !== 'html') {
      throw new Error('content is not html');
    }
    if (type !== 'html') {
      sendAxiosResponse(requestResponse, res);
      return;
    }
  } catch (error) {
    const err = error as AxiosError;
    if (err.response) {
      sendAxiosResponse(err.response, res);
    } else {
      res.status(NOT_FOUND).send(err.message);
    }
    return;
  }

  let page: Page | null = null;
  const pageURL = (webClient.defaults.baseURL as string) + proxiedURL;
  try {
    page = await browser.newPage();
    logger.info(`prerender ${pageURL}`);
    await page.goto(pageURL);
    await page.waitFor(renderTimeSeconds * 1000);
    if (windowsizeRenderTypes.includes(renderType)) {
      await page.setViewport(viewPort);
    }
    switch (renderType) {
      case RenderType.html:
        sendAxiosResponse(requestResponse, res, await page.content());
        break;
      case RenderType.pdf:
        res.contentType('pdf').status(OK).send(await page.pdf({ format: 'A4' }));
        break;
      case RenderType.png:
        res.contentType('png').send(await page.screenshot({
          type: 'png'
        }));
        break;
      case RenderType.jpg:
        res.contentType('jpg').send(await page.screenshot({
          quality: 100,
          type: 'jpeg'
        }));
        break;
      default:
        throw new Error('invalid render type provided');
    }
  } catch (error) {
    const err = error as Error;
    const message = `unable to render ${pageURL}: ${err.message}`;
    logger.error(message);
    res.status(NOT_FOUND).send(message);
  } finally {
    if (page) {
      page.close();
    }
  }
};

export default prerender;
