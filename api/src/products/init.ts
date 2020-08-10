import { ProductModel } from '../schema/payments/product';
import { deleteProductUtil } from './deleteProduct.resolver';
import { getLogger } from 'log4js';
import { CurrencyModel } from '../schema/payments/currency';
import { deleteCurrencyUtil } from '../currencies/deleteCurrency.resolver';
import { defaultCurrency } from '../currencies/getExchangeRate';
import { addCurrencyUtil } from '../currencies/addCurrency.resolver';
import { defaultProductName } from './product.resolver';
import { addProductUtil } from './addProduct.resolver';
import { Interval } from '../schema/payments/plan';

const logger = getLogger();

export const initializeProducts = async (): Promise<void> => {
  const products = await ProductModel.find({});
  for (const product of products) {
    await deleteProductUtil(product);
  }
  logger.info('deleted all products');

  const currencies = await CurrencyModel.find({});
  for (const currency of currencies) {
    await deleteCurrencyUtil(currency);
  }
  logger.info('deleted all currencies');

  if ((await CurrencyModel.countDocuments({
    name: defaultCurrency
  })) === 0) {
    await addCurrencyUtil({
      name: defaultCurrency
    });
  }

  if ((await ProductModel.countDocuments({
    name: defaultProductName
  })) === 0) {
    await addProductUtil({
      name: defaultProductName,
      plans: [{
        amount: 0,
        interval: Interval.month
      }],
      storage: Number.MAX_SAFE_INTEGER
    });
  }

  logger.info('done initializing currencies and products');
};
