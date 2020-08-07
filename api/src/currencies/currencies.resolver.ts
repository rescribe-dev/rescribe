import { Resolver, Query, ArgsType, Field, Args } from 'type-graphql';
import Currency, { CurrencyModel } from '../schema/payments/currency';
import { configData } from '../utils/config';
import { RedisKey, cache } from '../utils/redis';

const redisExpireSeconds = 60 * 20;

@ArgsType()
export class CurrenciesArgs {
  @Field(_type => [String], { description: 'currency names', nullable: true })
  names?: string[];
}

const getFilteredCurrencies = (args: CurrenciesArgs, currencies: Currency[]): Currency[] => {
  if (!args.names) {
    return currencies;
  }
  return currencies.filter(currency => args.names!.includes(currency.name));
};

@Resolver()
class CurrenciesResolver {
  @Query(_returns => [Currency])
  async currencies(@Args() args: CurrenciesArgs): Promise<Currency[]> {
    const redisKeyObject: RedisKey = {
      path: '',
      type: 'currencies'
    };
    const redisKey = JSON.stringify(redisKeyObject);
    const redisData = await cache.get(redisKey);
    if (redisData && !configData.DISABLE_CACHE) {
      const data = JSON.parse(redisData) as Currency[];
      return getFilteredCurrencies(args, data);
    }
    const currencies = await CurrencyModel.find({});
    await cache.set(redisKey, JSON.stringify(currencies), 'ex', redisExpireSeconds);
    return getFilteredCurrencies(args, currencies);
  }
}

export default CurrenciesResolver;
