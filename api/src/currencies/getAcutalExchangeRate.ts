import axios from 'axios';
import { defaultCurrency } from '../utils/variables';

export const forexURL = 'https://api.exchangeratesapi.io/latest';

interface ExchangeRateOutput {
  error: string;
  rates: { [currency: string]: number };
}

export const getActualExchangeRate = async (currency: string): Promise<number> => {
  currency = currency.toUpperCase();
  const res = await axios.get<ExchangeRateOutput>(forexURL, {
    params: {
      base: defaultCurrency.toUpperCase(),
      symbols: currency.toUpperCase()
    }
  });
  if (!(currency in res.data.rates)) {
    throw new Error(`cannot find currency ${currency} in forex output`);
  }
  return res.data.rates[currency];
};
