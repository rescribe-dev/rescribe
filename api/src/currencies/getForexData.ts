import axios from 'axios';
import { defaultCurrency } from '../shared/variables';

export const forexURL = 'https://api.exchangeratesapi.io/latest';

interface ExchangeRateOutput {
  error: string | undefined;
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
  if (res.data.error) {
    throw new Error(res.data.error);
  }
  if (!(currency in res.data.rates)) {
    throw new Error(`cannot find currency ${currency} in forex output`);
  }
  return res.data.rates[currency];
};

interface CurrenciesOutput {
  error: string | undefined;
  rates: { [currency: string]: number };
}

export const getCurrencies = async (): Promise<string[]> => {
  const res = await axios.get<CurrenciesOutput>(forexURL, {
    params: {
      base: defaultCurrency.toUpperCase()
    }
  });
  if (res.data.error) {
    throw new Error(res.data.error);
  }
  return Object.keys(res.data.rates).map(currency => currency.toLowerCase());
};
