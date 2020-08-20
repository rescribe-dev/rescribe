import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import Currency, { CurrencyModel } from '../schema/payments/currency';
import { GraphQLContext } from '../utils/context';
import { verifyAdmin } from '../auth/checkAuth';
import { requirePaymentSystemInitialized, stripeClient } from '../stripe/init';
import { ProductModel } from '../schema/payments/product';
import { UserCurrencyModel } from '../schema/users/userCurrency';
import { PaymentMethodModel } from '../schema/users/paymentMethod';

@ArgsType()
export class DeleteCurrencyArgs {
  @Field({ description: 'remove currency from accepted for payments' })
  name: string;
}

export const deleteCurrencyUtil = async (currencyData: Currency, deleteDB: boolean): Promise<void> => {
  const products = await ProductModel.find({});
  if (!products) {
    throw new Error('could not find products');
  }
  for (const product of products) {
    for (const plan of product.plans) {
      if (plan.currencies.has(currencyData.name)) {
        await stripeClient.plans.del(plan.currencies.get(currencyData.name) as string);
      }
    }
  }
  await ProductModel.updateMany({}, {
    $unset: {
      [`plans.currencies.${currencyData.name}`]: true
    }
  });
  await UserCurrencyModel.deleteMany({
    currency: currencyData.name
  });
  await PaymentMethodModel.deleteMany({
    currency: currencyData.name
  });
  if (deleteDB) {
    await CurrencyModel.deleteOne({
      name: currencyData.name
    });
  } else {
    await CurrencyModel.updateOne({
      name: currencyData.name
    }, {
      acceptedPayment: false
    });
  }
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
    await deleteCurrencyUtil(currencyData, false);
    return `deleted currency ${givenCurrency}`;
  }
}

export default DeleteCurrencyResolver;
