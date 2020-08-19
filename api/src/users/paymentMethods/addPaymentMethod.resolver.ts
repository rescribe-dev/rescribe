import { Resolver, Field, Args, Mutation, Ctx, ArgsType } from 'type-graphql';
import { requirePaymentSystemInitialized, stripeClient } from '../../stripe/init';
import { GraphQLContext } from '../../utils/context';
import { verifyLoggedIn } from '../../auth/checkAuth';
import { ObjectId } from 'mongodb';
import { UserModel } from '../../schema/users/user';
import PaymentMethod, { PaymentMethodModel } from '../../schema/users/paymentMethod';
import { validateCurrency } from '../../currencies/utils';
import UserCurrency, { UserCurrencyModel } from '../../schema/users/userCurrency';
import { MinLength } from 'class-validator';
import ReturnObj from '../../schema/utils/returnObj';
import { getLogger } from 'log4js';

const logger = getLogger();

@ArgsType()
class AddPaymentMethodArgs {
  @Field({ description: 'name' })
  currency: string;

  @MinLength(5, { message: 'invalid stripe card token provided' })
  @Field({ description: 'stripe card token' })
  cardToken: string;

  // TODO - handle setting default
  @Field({ description: 'set to default', defaultValue: true, nullable: true })
  setDefault: boolean;
}

@Resolver()
class AddPaymentMethodResolver {
  @Mutation(_returns => ReturnObj)
  async addPaymentMethod(@Args() args: AddPaymentMethodArgs, @Ctx() ctx: GraphQLContext): Promise<ReturnObj> {
    requirePaymentSystemInitialized();
    if (!verifyLoggedIn(ctx)) {
      throw new Error('user not logged in');
    }
    args.currency = await validateCurrency(args.currency);

    const userID = new ObjectId(ctx.auth?.id as string);
    const userData = await UserModel.findById(userID);
    if (!userData) {
      throw new Error(`cannot find user with id ${userID.toHexString()}`);
    }

    if (await PaymentMethodModel.countDocuments({
      user: userID,
      currency: args.currency,
      method: args.cardToken
    }) > 0) {
      throw new Error('payment method already exists');
    }

    let userCurrencyData: UserCurrency | null = await UserCurrencyModel.findOne({
      user: userID,
      currency: args.currency,
    });
    if (!userCurrencyData) {
      const stripeCustomer = await stripeClient.customers.create({
        email: userData.email,
        metadata: {
          id: userData._id.toHexString()
        }
      });
      const stripeCustomerID = stripeCustomer.id;
      const newUserCurrency: UserCurrency = {
        _id: new ObjectId(),
        currency: args.currency,
        customer: stripeCustomerID,
        user: userID
      };
      await new UserCurrencyModel(newUserCurrency).save();
      userCurrencyData = newUserCurrency;
    }
    const setupIntent = await stripeClient.setupIntents.create({
      confirm: true,
      customer: userCurrencyData.customer,
      payment_method: args.cardToken,
      payment_method_types: ['card'],
      description: `setup intent for adding ${args.cardToken} to user ${userID.toHexString()}`,
    });
    if (setupIntent.next_action) {
      logger.info(setupIntent.next_action);
      throw new Error('not handled next action');
    }
    const paymentMethodID = new ObjectId();
    const newPaymentMethod: PaymentMethod = {
      _id: paymentMethodID,
      user: userID,
      currency: args.currency,
      method: args.cardToken
    };
    await new PaymentMethodModel(newPaymentMethod).save();
    return {
      message: `added / updated payment method ${paymentMethodID.toHexString()}`,
      _id: paymentMethodID,
    };
  }
}

export default AddPaymentMethodResolver;
