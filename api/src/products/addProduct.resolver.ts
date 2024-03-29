import { Resolver, Field, Args, Mutation, Ctx, InputType, ArgsType } from 'type-graphql';
import { CurrencyModel } from '../schema/payments/currency';
import { GraphQLContext } from '../utils/context';
import { verifyAdmin } from '../auth/checkAuth';
import { stripeClient, requirePaymentSystemInitialized } from '../stripe/init';
import Plan, { Interval, singlePurchase } from '../schema/payments/plan';
import Product, { ProductModel } from '../schema/payments/product';
import { IsInt, Min } from 'class-validator';
import { getActualExchangeRate } from '../currencies/getForexData';
import { defaultProductName } from '../shared/variables';
import { ObjectId } from 'mongodb';

const maxTrialPeriod = 720; // days

@InputType()
class PlanInput {
  @Field({ description: 'plan interval' })
  interval: Interval;

  @Field({ description: 'plan cost' })
  amount: number;
}

@ArgsType()
export class AddProductArgs {
  @Field({ description: 'product name' })
  name: string;

  @Field(_type => PlanInput, { description: 'plans for product' })
  plans: PlanInput[];

  @IsInt({
    message: 'storage must be an integer'
  })
  @Min(1, {
    message: 'storage must be >= 1'
  })
  @Field({ description: 'storage allowed (in bytes)' })
  storage: number;

  @IsInt({
    message: 'private repositories must be an integer'
  })
  @Min(1, {
    message: 'private repositories must be >= 1'
  })
  @Field({ description: 'number of private repositories allowed' })
  privateRepositories: number;

  @IsInt({
    message: 'public repositories must be an integer'
  })
  @Min(1, {
    message: 'public repositories must be >= 1'
  })
  @Field({ description: 'number of public repositories allowed' })
  publicRepositories: number;
}

export const addProductUtil = async (args: AddProductArgs): Promise<Product> => {
  const stripeProduct = await stripeClient.products.create({
    name: args.name,
    active: true,
    type: 'service'
  });
  const currencies = await CurrencyModel.find({
    acceptedPayment: true
  });
  if (!currencies) {
    throw new Error('cannot find any currencies');
  }
  const exchangeRates: Record<string, number> = {};
  for (const currency of currencies) {
    exchangeRates[currency.name] = await getActualExchangeRate(currency.name);
  }
  const plans: Plan[] = [];
  let isFree = true;
  for (const plan of args.plans) {
    const currentPlan: Plan = {
      ...plan,
      currencies: new Map<string, string>()
    };
    if (plan.interval !== singlePurchase) {
      for (const currency of currencies) {
        const stripePlan = await stripeClient.plans.create({
          currency: currency.name,
          interval: plan.interval,
          trial_period_days: args.name === defaultProductName ? maxTrialPeriod : undefined,
          product: stripeProduct.id,
          billing_scheme: 'per_unit',
          usage_type: 'licensed',
          amount: Math.ceil(100 * plan.amount * exchangeRates[currency.name])
        });
        currentPlan.currencies.set(currency.name, stripePlan.id);
      }
    }
    if (plan.amount > 0) {
      isFree = false;
    }
    plans.push(currentPlan);
  }
  const newProduct: Product = {
    _id: new ObjectId(),
    name: args.name,
    plans,
    storage: args.storage,
    privateRepositories: args.privateRepositories,
    publicRepositories: args.publicRepositories,
    stripeID: stripeProduct.id,
    isFree,
  };
  await new ProductModel(newProduct).save();
  return newProduct;
};

@Resolver()
class AddProductResolver {
  @Mutation(_returns => String)
  async addProduct(@Args() args: AddProductArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    requirePaymentSystemInitialized();
    if (!verifyAdmin(ctx)) {
      throw new Error('user must be admin to add a product');
    }
    const newProduct = await addProductUtil(args);
    return `added product ${newProduct.name}`;
  }
}

export default AddProductResolver;
