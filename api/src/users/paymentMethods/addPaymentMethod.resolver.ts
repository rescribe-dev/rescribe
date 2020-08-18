import { Resolver, Field, Args, Mutation, Ctx, ArgsType } from 'type-graphql';
import { requirePaymentSystemInitialized, stripeClient } from '../../stripe/init';
import { GraphQLContext } from '../../utils/context';
import { verifyLoggedIn } from '../../auth/checkAuth';
import { ObjectId } from 'mongodb';
import { UserModel } from '../../schema/users/user';
import PaymentMethod, { PaymentMethodModel } from '../../schema/users/paymentMethod';
import { validateCurrency } from '../../currencies/utils';
import UserCurrency, { UserCurrencyModel } from '../../schema/users/userCurrency';

@ArgsType()
class AddPaymentMethodArgs {
  @Field({ description: 'name' })
  currency: string;

  @Field({ description: 'stripe card token' })
  cardToken: string;

  // TODO - handle setting default
  @Field({ description: 'set to default', defaultValue: true, nullable: true })
  setDefault: boolean;
}

@Resolver()
class AddPaymentMethodResolver {
  @Mutation(_returns => String)
  async addPaymentMethod(@Args() args: AddPaymentMethodArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
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

    const userCurrencyData = await UserCurrencyModel.findOne({
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
    }
    const paymentMethodID = new ObjectId();
    const newPaymentMethod: PaymentMethod = {
      _id: paymentMethodID,
      user: userID,
      currency: args.currency,
      method: args.cardToken
    };
    await new PaymentMethodModel(newPaymentMethod).save();
    return `added / updated payment method ${paymentMethodID.toHexString()}`;
  }
}

export default AddPaymentMethodResolver;
