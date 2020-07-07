import exitHook from 'exit-hook';
import { launch, Browser } from 'puppeteer';
import { getLogger } from 'log4js';

const logger = getLogger();

export let browser: Browser;

export const initializePuppet = async (): Promise<void> => {
  browser = await launch();
  exitHook(() => {
    logger.info('close browser');
    browser.close();
  });
};
