import exitHook from 'exit-hook';
import { launch, Browser } from 'puppeteer';
import { getLogger } from 'log4js';

const logger = getLogger();

export let browser: Browser;

export const initializePuppet = async (): Promise<void> => {
  // see this: https://stackoverflow.com/a/51038064/8623391
  browser = await launch({
    headless: true,
    args: ['--no-sandbox'],
  });
  exitHook(() => {
    logger.info('close browser');
    browser.close();
  });
};
