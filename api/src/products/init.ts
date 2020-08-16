import { ProductModel } from '../schema/payments/product';
import { deleteProductUtil } from './deleteProduct.resolver';
import { getLogger } from 'log4js';
import { CurrencyModel } from '../schema/payments/currency';
import { deleteCurrencyUtil } from '../currencies/deleteCurrency.resolver';
import { addCurrencyUtil } from '../currencies/addCurrency.resolver';
import { addProductUtil } from './addProduct.resolver';
import { requirePaymentSystemInitialized } from '../stripe/init';
import { getCurrencies } from '../currencies/getForexData';
import { defaultAcceptedCurrencies, defaultProducts } from './defaults';

const logger = getLogger();

export const initializeProducts = async (): Promise<string> => {
  requirePaymentSystemInitialized();
  const products = await ProductModel.find({});
  for (const product of products) {
    await deleteProductUtil(product);
  }
  logger.info('deleted all products');

  const currencies = await CurrencyModel.find({});
  for (const currency of currencies) {
    await deleteCurrencyUtil(currency, true);
  }
  logger.info('deleted all currencies');

  for (const currency of await getCurrencies()) {
    await addCurrencyUtil({
      name: currency
    }, defaultAcceptedCurrencies.includes(currency));
  }
  logger.info('added all currencies');

  for (const product of defaultProducts) {
    await addProductUtil(product); 
  }
  logger.info('added all default products');

  return 'done initializing currencies and products';
};
