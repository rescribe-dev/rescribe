import { Resolver, Field, Args, Mutation, Ctx, ArgsType } from 'type-graphql';
import { requirePaymentSystemInitialized } from '../../stripe/init';
import { GraphQLContext } from '../../utils/context';
import { verifyLoggedIn } from '../../auth/checkAuth';
import { ObjectId } from 'mongodb';
import { UserModel } from '../../schema/users/user';
import { PaymentMethodModel } from '../../schema/users/paymentMethod';

@ArgsType()
class SetDefaultPaymentMethodArgs {
  @Field({ description: 'payment method object id' })
  id: ObjectId;
}

@Resolver()
class SetDefaultPaymentMethodResolver {
  @Mutation(_returns => String)
  async setDefaultPaymentMethod(@Args() args: SetDefaultPaymentMethodArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    requirePaymentSystemInitialized();
    if (!verifyLoggedIn(ctx)) {
      throw new Error('user not logged in');
    }

    const userID = new ObjectId(ctx.auth?.id as string);
    const userData = await UserModel.findById(userID);
    if (!userData) {
      throw new Error(`cannot find user with id ${userID.toHexString()}`);
    }

    const currentPaymentMethodData = await PaymentMethodModel.findById(args.id);
    if (!currentPaymentMethodData) {
      throw new Error(`cannot find payment method with id ${args.id.toHexString()}`);
    }
    await UserModel.updateOne({
      _id: args.id
    }, {
      $set: {
        defaultPaymentMethod: args.id
      }
    });

    return `set default payment method to ${args.id.toHexString()}`;
  }
}

export default SetDefaultPaymentMethodResolver;
