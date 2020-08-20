import { Resolver, Field, Args, Mutation, Ctx, ArgsType } from 'type-graphql';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { stripeClient, requirePaymentSystemInitialized } from './init';
import { Interval, singlePurchase } from '../schema/payments/plan';
import { ProductModel } from '../schema/payments/product';
import { ObjectId } from 'mongodb';
import { UserModel } from '../schema/users/user';
import Coupon, { CouponModel } from '../schema/payments/coupon';
import { getExchangeRate } from '../currencies/getExchangeRate';
import PaymentMethod, { PaymentMethodModel } from '../schema/users/paymentMethod';
import { UserCurrencyModel } from '../schema/users/userCurrency';
import { configData } from '../utils/config';
import { defaultCurrency } from '../shared/variables';
import ReturnObj from '../schema/utils/returnObj';
import { ApolloError } from 'apollo-server-express';
import { INTERNAL_SERVER_ERROR } from 'http-status-codes';
import Address, { AddressModel } from '../schema/users/address';

@ArgsType()
export class PurchaseArgs {
  @Field({ description: 'product id' })
  product: string;

  @Field(_type => Interval, { description: 'plan interval for product' })
  interval: Interval;

  @Field({ description: 'coupon - only allow one at a time for now', nullable: true })
  coupon?: string;

  @Field({ description: 'payment method id', nullable: true })
  paymentMethod?: ObjectId;

  @Field({ description: 'address id', nullable: true })
  address?: ObjectId;
}

@Resolver()
class PurchaseResolver {
  @Mutation(_returns => ReturnObj)
  async purchase(@Args() args: PurchaseArgs, @Ctx() ctx: GraphQLContext): Promise<ReturnObj> {
    requirePaymentSystemInitialized();
    if (!verifyLoggedIn(ctx)) {
      throw new Error('user not logged in');
    }

    let coupon: Coupon | null = null;
    // check coupon
    if (args.coupon && args.coupon.length > 0) {
      const couponData = await CouponModel.findOne({
        name: args.coupon
      });
      if (!couponData) {
        throw new Error(`cannot find coupon with secret ${args.coupon}`);
      }
      coupon = couponData;
    }

    const userID = new ObjectId(ctx.auth?.id);
    const user = await UserModel.findById(userID);
    if (!user) {
      throw new Error(`cannot find user with id ${userID.toHexString()}`);
    }

    const product = await ProductModel.findOne({
      name: args.product
    });
    if (!product) {
      throw new Error(`cannot find product ${args.product}`);
    }

    let currency = '';

    if (product.isFree) {
      currency = defaultCurrency;
    } else if (!args.paymentMethod) {
      if (!user.defaultPaymentMethod) {
        throw new Error('no default payment method found');
      }
      if (await PaymentMethodModel.countDocuments({
        _id: user.defaultPaymentMethod
      }) === 0) {
        const newDefaultPaymentMethod = await PaymentMethodModel.findOne({
          user: userID
        });
        if (!newDefaultPaymentMethod) {
          throw new Error('cannot find any payment methods to make default');
        }
        user.defaultPaymentMethod = newDefaultPaymentMethod._id;
        await UserModel.updateOne({
          _id: userID
        }, {
          defaultPaymentMethod: user.defaultPaymentMethod
        });
      }
      args.paymentMethod = user.defaultPaymentMethod;
    }

    let paymentMethod: PaymentMethod | undefined;
    if (!product.isFree && args.paymentMethod) {
      const potentialPaymentMethod = await PaymentMethodModel.findById(args.paymentMethod);
      if (!potentialPaymentMethod) {
        throw new Error(`cannot find payment method with id ${args.paymentMethod.toHexString()}`);
      }
      paymentMethod = potentialPaymentMethod;
      currency = paymentMethod.currency;
    }

    if (currency.length === 0) {
      throw new Error('cannot find currency');
    }

    const userCurrencyData = await UserCurrencyModel.findOne({
      user: userID,
      currency,
    });
    if (!userCurrencyData) {
      throw new Error('cannot find user currency data');
    }

    let amount = 0;
    let foundPlan = false;
    let subscriptionPlanID: string | null = null;
    for (const plan of product.plans) {
      if (plan.interval === args.interval) {
        foundPlan = true;
        if (plan.interval === singlePurchase) {
          amount = plan.amount;
        } else {
          let foundCurrency = false;
          for (const currentCurrency of plan.currencies.keys()) {
            if (currentCurrency === currency) {
              foundCurrency = true;
              subscriptionPlanID = plan.currencies.get(currentCurrency) as string;
            }
          }
          if (!foundCurrency) {
            throw new Error(`could not find currency ${currency} in plan`);
          }
        }
      }
    }
    if (!foundPlan) {
      throw new Error(`could not find plan with interval ${args.interval}`);
    }

    let address: Address | undefined;
    if (!product.isFree && paymentMethod && !paymentMethod.address) {
      if (!args.address) {
        if (!user.defaultAddress) {
          throw new Error('no default address found');
        }
        if (await AddressModel.countDocuments({
          _id: user.defaultAddress
        }) === 0) {
          const newDefaultAddress = await AddressModel.findOne({
            user: userID
          });
          if (!newDefaultAddress) {
            throw new Error('cannot find any addresses to make default');
          }
          user.defaultAddress = newDefaultAddress._id;
          await UserModel.updateOne({
            _id: userID
          }, {
            defaultAddress: user.defaultAddress
          });
        }
        args.address = user.defaultAddress;
      }
      const potentialAddress = await AddressModel.findById(args.address);
      if (!potentialAddress) {
        throw new Error(`cannot find address with id ${args.address.toHexString()}`);
      }
      address = potentialAddress;
    }

    // update billing address on card
    if (!product.isFree && paymentMethod && address) {
      await stripeClient.paymentMethods.update(paymentMethod.method, {
        billing_details: {
          address: {
            city: address.city,
            country: address.country,
            line1: address.line1,
            line2: address.line2,
            state: address.state,
            postal_code: address.postal_code,
          },
        },
      });
      await PaymentMethodModel.updateOne({
        _id: paymentMethod._id
      }, {
        $set: {
          address: address._id,
        }
      });
    }

    const successMessage = `user ${user.username} purchased ${product.name}`;
    if (args.interval !== singlePurchase) {
      const newSubscription = await stripeClient.subscriptions.create({
        customer: userCurrencyData.customer,
        items: [{
          plan: subscriptionPlanID as string
        }],
        coupon: coupon ? coupon.name : undefined,
        default_payment_method: product.isFree || !paymentMethod ? undefined : paymentMethod.method,
      });
      if (user.subscriptionID.length > 0) {
        await stripeClient.subscriptions.del(user.subscriptionID);
      }
      await UserModel.updateOne({
        _id: userID
      }, {
        $set: {
          plan: product.name,
          subscriptionID: newSubscription.id
        }
      });
      return {
        message: successMessage,
      };
    } else if (!product.isFree) {
      if (typeof paymentMethod === 'undefined') {
        throw new ApolloError('payment method undefined', `${INTERNAL_SERVER_ERROR}`);
      }
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
      const exchangeRate = await getExchangeRate(currency, configData.DISABLE_CACHE);
      // remove cents
      amount = Math.ceil(100 * amount * exchangeRate);
      const paymentIntent = await stripeClient.paymentIntents.create({
        amount,
        currency,
        customer: userCurrencyData.customer,
        payment_method: (paymentMethod as PaymentMethod).method,
        metadata: {
          product: product.name,
          userID: userID.toHexString()
        }
      });
      const clientSecret = paymentIntent.client_secret as string;
      return {
        message: successMessage,
        data: clientSecret,
      };
    } else {
      return {
        message: successMessage,
      };
    }
  }
}

export default PurchaseResolver;
