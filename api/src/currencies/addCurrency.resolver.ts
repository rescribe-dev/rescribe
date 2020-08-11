import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import Currency, { CurrencyModel } from '../schema/payments/currency';
import { GraphQLContext } from '../utils/context';
import { verifyAdmin } from '../auth/checkAuth';
import { stripeClient, requirePaymentSystemInitialized } from '../stripe/init';
import { defaultCurrency } from './getExchangeRate';
import { getActualExchangeRate } from './getAcutalExchangeRate';

export const defaultCountry = 'us';

@ArgsType()
export class AddCurrencyArgs {
  @Field({ description: 'currency name' })
  name: string;
}

export const addCurrencyUtil = async (args: AddCurrencyArgs): Promise<Currency> => {
  const givenCurrency = args.name.toUpperCase();
  const givenCountry = defaultCountry.toLowerCase();
  const defaultCountryData = await stripeClient.countrySpecs.retrieve(givenCountry);
  if ((await CurrencyModel.countDocuments({
    name: givenCurrency
  })) > 0) {
    throw new Error(`currency ${givenCurrency} already exists`);
  }
  let exchangeRate = 1;
  if (givenCurrency !== defaultCurrency) {
    if (!defaultCountryData.supported_payment_currencies.includes(givenCurrency)) {
      throw new Error(`given currency ${givenCurrency} unsupported in ${givenCountry}`);
    }
    exchangeRate = await getActualExchangeRate(givenCurrency);
  }
  const newCurrency: Currency = {
    name: givenCurrency,
    exchangeRate
  };
  await new CurrencyModel(newCurrency).save();
  return newCurrency;
};

@Resolver()
class AddCurrencyResolver {
  @Mutation(_returns => String)
  async addCurrency(@Args() args: AddCurrencyArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    requirePaymentSystemInitialized();
    if (!verifyAdmin(ctx)) {
      throw new Error('user must be admin to add a currency');
    }
    const newCurrency = await addCurrencyUtil(args);
    return `added currency ${newCurrency.name} with exchange rate ${newCurrency.exchangeRate}`;
  }
}

export default AddCurrencyResolver;
