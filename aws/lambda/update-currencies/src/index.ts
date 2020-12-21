import { EventBridgeHandler } from 'aws-lambda';
import { getLogger } from 'log4js';
import { initializeDB } from './shared/db/connect';
import { initializeConfig } from './utils/config';
import { dbConnectionURI, dbName } from './shared/global-config';
import { initializeLogger } from './utils/logger';
import { CurrencyModel } from './shared/schema/payments/currency';
import { getActualExchangeRate } from './shared/currencies/getForexData';

const logger = getLogger();

const updateAllCurrencies = async (): Promise<void> => {
  logger.info('start db initialize');
  await initializeDB(dbConnectionURI, dbName);
  logger.info('database connection set up');

  for (const currency of await CurrencyModel.find({})) {
    await CurrencyModel.updateOne({
      _id: currency._id
    }, {
      $set: {
        exchangeRate: await getActualExchangeRate(currency.name)
      }
    });
  }
};

export const handler: EventBridgeHandler<string, null, void> = async (_event, _context, callback): Promise<void> => {
  await initializeConfig(false);
  initializeLogger();
  await updateAllCurrencies();
  callback();
  process.exit(0);
};

const runUpdate = async (): Promise<void> => {
  await initializeConfig(true);
  initializeLogger();
  await updateAllCurrencies();
};

if (require.main === module) {
  runUpdate().then(() => {
    logger.info('done with update');
    process.exit(0);
  }).catch((err: Error) => {
    console.error(err.message);
    process.exit(1);
  });
}

export default runUpdate;
