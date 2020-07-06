import { Request, Response } from 'express';
import { Browser, Page } from 'puppeteer';
import { configData } from './utils/config';
import { parse } from 'url';
import { getLogger } from 'log4js';
import { NOT_FOUND, OK } from 'http-status-codes';

const logger = getLogger();

const prerender = async (req: Request, res: Response, browser: Browser): Promise<void> => {
  const url = parse(req.url);
  let page: Page | null = null;
  try {
    page = await browser.newPage();
    page.goto(configData.WEBSITE_URL + url.path + url.query);
    const html = await page.content();
    res.send(html).contentType('html').status(OK);
  } catch (error) {
    const err = error as Error;
    const message = `unable to get ${url}: ${err.message}`;
    logger.debug(message);
    res.status(NOT_FOUND).send(message);
  } finally {
    if (page) {
      page.close();
    }
  }
};

export default prerender;
