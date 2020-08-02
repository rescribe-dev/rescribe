import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import Currency, { CurrencyModel } from '../schema/payments/currency';
import { GraphQLContext } from '../utils/context';
import { verifyAdmin } from '../auth/checkAuth';
import { requirePaymentSystemInitialized, stripeClient } from '../stripe/init';
import { ProductModel } from '../schema/payments/product';
import { UserModel } from '../schema/auth/user';

export const defaultCountry = 'us';

@ArgsType()
export class DeleteCurrencyArgs {
  @Field({ description: 'currency name' })
  name: string;
}

export const deleteCurrencyUtil = async (currencyData: Currency): Promise<void> => {
  const products = await ProductModel.find({});
  if (!products) {
    throw new Error('could not find products');
  }
  for (const product of products) {
    for (const plan of product.plans) {
      if (currencyData.name in plan.currencies) {
        stripeClient.plans.del(plan.currencies[currencyData.name]);
      }
    }
  }
  await ProductModel.updateMany({}, {
    $unset: {
      [`plans.currencies.${currencyData.name}`]: true
    }
  });
  for (const user of await UserModel.find({
    [`paymentMethods.${currencyData.name}`]: {
      $exists: true
    }
  })) {
    const method = user.paymentMethods[currencyData.name];
    if (method.payment.length > 0) {
      await stripeClient.paymentMethods.detach(method.payment);
    }
    await stripeClient.customers.del(method.customer);
  }
  await UserModel.updateMany({}, {
    $unset: {
      [`paymentMethods.${currencyData.name}`]: true
    }
  });
  await CurrencyModel.deleteOne({
    name: currencyData.name
  });
};

@Resolver()
class DeleteCurrencyResolver {
  @Mutation(_returns => String)
  async deleteCurrency(@Args() args: DeleteCurrencyArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    requirePaymentSystemInitialized();
    if (!verifyAdmin(ctx)) {
      throw new Error('user must be admin to delete currency');
    }
    const givenCurrency = args.name.toUpperCase();
    const currencyData = await CurrencyModel.findOne({
      name: givenCurrency
    });
    if (!currencyData) {
      throw new Error(`cannot find currency ${givenCurrency}`);
    }
    await deleteCurrencyUtil(currencyData);
    return `deleted currency ${givenCurrency}`;
  }
}

export default DeleteCurrencyResolver;
