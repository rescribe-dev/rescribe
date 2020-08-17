import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import Currency, { CurrencyModel } from '../schema/payments/currency';
import { GraphQLContext } from '../utils/context';
import { verifyAdmin } from '../auth/checkAuth';
import { stripeClient, requirePaymentSystemInitialized } from '../stripe/init';
import { defaultCurrency, defaultCountry } from '../shared/variables';
import { getActualExchangeRate } from './getForexData';
import { ObjectId } from 'mongodb';

@ArgsType()
export class AddCurrencyArgs {
  @Field({ description: 'add currency to accepted for payments' })
  name: string;
}

export const addCurrencyUtil = async (args: AddCurrencyArgs, acceptedPayment: boolean): Promise<Currency> => {
  const givenCurrency = args.name.toLowerCase();
  const givenCountry = defaultCountry.toLowerCase();
  const defaultCountryData = await stripeClient.countrySpecs.retrieve(givenCountry);
  let exchangeRate = 1;
  if (givenCurrency !== defaultCurrency) {
    if (!defaultCountryData.supported_payment_currencies.includes(givenCurrency)) {
      throw new Error(`given currency ${givenCurrency} unsupported in ${givenCountry}`);
    }
    exchangeRate = await getActualExchangeRate(givenCurrency);
  }
  const newCurrency: Currency = {
    _id: new ObjectId(),
    name: givenCurrency,
    exchangeRate,
    acceptedPayment
  };
  await CurrencyModel.updateOne({
    name: givenCurrency,
  }, {
    $set: newCurrency
  }, {
    upsert: true
  });
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
    const newCurrency = await addCurrencyUtil(args, true);
    return `added currency ${newCurrency.name} with exchange rate ${newCurrency.exchangeRate}`;
  }
}

export default AddCurrencyResolver;
