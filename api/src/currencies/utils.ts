import { CurrencyModel } from '../schema/payments/currency';

export const validateCurrency = async (currency: string): Promise<string> => {
  currency = currency.toUpperCase();
  const currencies = await CurrencyModel.find({});
  if (currencies.findIndex(curr_currency => currency === curr_currency.name) < 0) {
    throw new Error(`invalid currency ${currency} provided`);
  }
  return currency;
};
