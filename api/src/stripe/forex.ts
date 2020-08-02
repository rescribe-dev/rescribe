import axios from 'axios';
import { RedisKey, cache } from '../utils/redis';
import { configData } from '../utils/config';

export const forexURL = 'https://api.exchangeratesapi.io/latest';
export const defaultCurrency = 'usd';

const redisExpireSeconds = 60 * 20;

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

export const getExchangeRate = async (currency: string): Promise<number> => {
  const redisKeyObject: RedisKey = {
    path: currency,
    type: 'forex'
  };
  const redisKey = JSON.stringify(redisKeyObject);
  const redisData = await cache.get(redisKey);
  if (redisData && !configData.DISABLE_CACHE) {
    return parseFloat(redisData);
  }
  const forexRate = await getActualExchangeRate(currency);
  await cache.set(redisKey, forexRate, 'ex', redisExpireSeconds);
  return forexRate;
};
