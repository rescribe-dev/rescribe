import { RedisKey, cache } from '../utils/redis';
import { getActualExchangeRate } from './getAcutalExchangeRate';

const redisExpireSeconds = 60 * 20;

export const getExchangeRate = async (currency: string, disableCache: boolean): Promise<number> => {
  const redisKeyObject: RedisKey = {
    path: currency,
    type: 'forex'
  };
  const redisKey = JSON.stringify(redisKeyObject);
  const redisData = await cache.get(redisKey);
  if (redisData && !disableCache) {
    return parseFloat(redisData);
  }
  const forexRate = await getActualExchangeRate(currency);
  await cache.set(redisKey, forexRate, 'ex', redisExpireSeconds);
  return forexRate;
};
