import { Resolver, Query } from 'type-graphql';
import { configData } from '../utils/config';
import { stripeClient } from './init';
import { RedisKey, cache } from '../utils/redis';

const redisExpireSeconds = 60 * 20;

@Resolver()
class CountriesResolver {
  @Query(_returns => [String])
  async countries(): Promise<string[]> {
    const redisKeyObject: RedisKey = {
      path: '',
      type: 'countries'
    };
    const redisKey = JSON.stringify(redisKeyObject);
    const redisData = await cache.get(redisKey);
    if (redisData && !configData.DISABLE_CACHE) {
      const data = JSON.parse(redisData) as string[];
      return data;
    }
    const countries: string[] = [];
    const perpage = 10;
    let lastCountry: string | undefined = undefined;
    for (;;) {
      const countryData = await stripeClient.countrySpecs.list({
        starting_after: lastCountry,
        limit: perpage
      });
      countries.concat(countryData.data.map(data => data.id));
      if (!countryData.has_more) {
        break;
      }
      lastCountry = countries[countries.length - 1];
    }
    await cache.set(redisKey, JSON.stringify(countries), 'ex', redisExpireSeconds);
    return countries;
  }
}

export default CountriesResolver;
