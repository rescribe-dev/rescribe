import { Resolver, Field, Args, Mutation, Ctx, ArgsType } from 'type-graphql';
import { CurrencyModel } from '../schema/payments/currency';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { stripeClient, requirePaymentSystemInitialized } from './init';
import { Interval, singlePurchase } from '../schema/payments/plan';
import { ProductModel } from '../schema/payments/product';
import { ObjectId } from 'mongodb';
import { UserModel } from '../schema/auth/user';
import CurrencyPaymentMethods from '../schema/payments/paymentMethod';
import { verifyRecaptcha } from '../utils/recaptcha';
import Coupon, { CouponModel } from '../schema/payments/coupon';
import { getExchangeRate } from './forex';

@ArgsType()
export class PurchaseArgs {
  @Field({ description: 'product id' })
  product: string;

  @Field(_type => Interval, { description: 'plan interval for product' })
  interval: Interval;

  @Field({ description: 'stripe card token' })
  cardToken: string;

  @Field({ description: 'coupon - only allow one at a time for now' })
  coupon: string;

  @Field({ description: 'currency' })
  currency: string;

  @Field(_type => String, { description: 'recaptcha token' })
  recaptchaToken: string;
}

interface UpdateUserData {
  $set: Record<string, unknown>;
  $addToSet: Record<string, unknown>;
}

@Resolver()
class PurchaseResolver {
  @Mutation(_returns => String)
  async purchase(@Args() args: PurchaseArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    requirePaymentSystemInitialized();
    if (!verifyLoggedIn(ctx)) {
      throw new Error('user not logged in');
    }
    if (!(await verifyRecaptcha(args.recaptchaToken))) {
      throw new Error('invalid recaptcha token');
    }

    args.currency = args.currency.toUpperCase();
    const currencies = await CurrencyModel.find({});
    if (currencies.findIndex(currency => currency.name === args.currency) < 0) {
      throw new Error(`invalid currency ${args.currency} provided`);
    }
    let coupon: Coupon | null = null;
    // check coupon
    if (args.coupon.length > 0) {
      const couponData = await CouponModel.findOne({
        name: args.coupon
      });
      if (!couponData) {
        throw new Error(`cannot find coupon with secret ${args.coupon}`);
      }
      coupon = couponData;
    }
    const product = await ProductModel.findOne({
      name: args.product
    });
    if (!product) {
      throw new Error(`cannot find product ${args.product}`);
    }
    const userID = new ObjectId(ctx.auth?.id);
    const user = await UserModel.findById(userID);
    if (!user) {
      throw new Error(`cannot find user with id ${userID.toHexString()}`);
    }
    let amount = 0;
    const foundPlan = false;
    let subscriptionPlanID: string | null = null;
    for (const plan of product.plans) {
      if (plan.interval === args.interval) {
        if (plan.interval === singlePurchase) {
          amount = plan.amount;
        } else {
          let foundCurrency = false;
          for (const currency in plan.currencies) {
            if (currency === args.currency) {
              foundCurrency = true;
              subscriptionPlanID = plan.currencies[currency];
            }
          }
          if (!foundCurrency) {
            throw new Error(`could not find currency ${args.currency} in plan`);
          }
        }
      }
    }
    if (!foundPlan) {
      throw new Error(`could not find plan with interval ${args.interval}`);
    }

    const userUpdates: UpdateUserData = {
      $set: {},
      $addToSet: {}
    };

    let hasPaymentMethodAlready = false;
    let stripeCustomerID: string;
    if (args.currency in user.paymentMethods) {
      const currentMethods = user.paymentMethods[args.currency];
      // TODO - check if tokens are actually the same
      if (!currentMethods.methods.find(data => data.method === args.cardToken)) {
        // add payment method
        userUpdates.$addToSet[`paymentMethods.${args.currency}.methods`] = args.cardToken;
        hasPaymentMethodAlready = true;
      }
      stripeCustomerID = currentMethods.customer;
    } else {
      const stripeCustomer = await stripeClient.customers.create({
        email: user.email,
        metadata: {
          id: user._id.toHexString()
        }
      });
      stripeCustomerID = stripeCustomer.id;
      const paymentMethods: CurrencyPaymentMethods = {
        customer: stripeCustomerID,
        methods: [{
          method: args.cardToken
        }]
      };
      userUpdates.$set[`paymentMethods.${args.currency}`] = paymentMethods;
    }
    if (!hasPaymentMethodAlready) {
      await stripeClient.paymentMethods.attach(args.cardToken, {
        customer: stripeCustomerID
      });
    }
    // TODO - put elsewhere
    await stripeClient.customers.update(stripeCustomerID, {
      invoice_settings: {
        default_payment_method: args.cardToken
      }
    });

    let clientSecret = '';
    if (args.interval !== singlePurchase) {
      if (user.subscriptionID.length > 0) {
        await stripeClient.subscriptions.del(user.subscriptionID);
      }
      const newSubscription = await stripeClient.subscriptions.create({
        customer: stripeCustomerID,
        items: [{
          plan: subscriptionPlanID as string
        }],
        coupon: coupon ? coupon.name : undefined
      });
      userUpdates.$set.plan = product.name,
        userUpdates.$set.subscriptionID = newSubscription.id;
    } else {
      if (coupon) {
        if (coupon.isPercent) {
          amount *= coupon.amount / 100.0;
        } else {
          amount -= coupon.amount;
          if (amount < 0) {
            amount = 0;
          }
        }
      }
      const exchangeRate = await getExchangeRate(args.currency);
      // remove cents
      amount = Math.ceil(100 * amount * exchangeRate);
      const paymentIntent = await stripeClient.paymentIntents.create({
        amount,
        currency: args.currency,
        metadata: {
          product: product.name,
          userID: userID.toHexString()
        }
      });
      clientSecret = paymentIntent.client_secret as string;
    }

    await UserModel.updateOne({
      _id: userID
    }, userUpdates);

    return clientSecret.length > 0 ? clientSecret :
      `user ${user.username} purchased ${product.name}`;
  }
}

export default PurchaseResolver;
