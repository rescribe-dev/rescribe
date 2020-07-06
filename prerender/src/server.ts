import cors, { CorsOptions } from 'cors';
import express from 'express';
import { getLogger } from 'log4js';
import { createServer } from 'http';
import { configData } from './utils/config';
import { OK } from 'http-status-codes';
import { launch } from 'puppeteer';
import prerender from './prerender';

const logger = getLogger();

export const initializeServer = async (): Promise<void> => {
  const app = express();
  const corsConfig: CorsOptions = {
    credentials: true,
    origin: configData.WEBSITE_URL
  };
  const browser = await launch();

  app.use(cors(corsConfig));
  app.get('*', (req, res) => prerender(req, res, browser));
  app.get('/_hello', (_, res) => {
    res.json({
      message: 'hello world!'
    });
  });
  app.get('/_ping', (_, res) => {
    res.status(OK).send();
  });
  const httpServer = createServer(app);
  httpServer.listen(configData.PORT, () => logger.info(`Prerendering service started: http://localhost:${configData.PORT} 🚀`));
};
