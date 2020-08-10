import { Resolver, Field, Args, Mutation, Ctx, ArgsType } from 'type-graphql';
import { requirePaymentSystemInitialized, stripeClient } from '../../stripe/init';
import { GraphQLContext } from '../../utils/context';
import { verifyLoggedIn } from '../../auth/checkAuth';
import { ObjectId } from 'mongodb';
import { PaymentMethodModel } from '../../schema/users/paymentMethod';
import { UserModel } from '../../schema/users/user';

@ArgsType()
class DeletePaymentMethodArgs {
  @Field({ description: 'payment method id' })
  id: ObjectId;
}

@Resolver()
class DeletePaymentMethodResolver {
  @Mutation(_returns => String)
  async deletePaymentMethod(@Args() args: DeletePaymentMethodArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    requirePaymentSystemInitialized();
    if (!verifyLoggedIn(ctx)) {
      throw new Error('user not logged in');
    }

    const currentPaymentMethodData = await PaymentMethodModel.findById(args.id);
    if (!currentPaymentMethodData) {
      throw new Error(`cannot find payment method with id ${args.id.toHexString()}`);
    }
    const userID = new ObjectId(ctx.auth?.id as string);
    if (!currentPaymentMethodData.user.equals(userID)) {
      throw new Error('user not authorized to view payment method data');
    }
    await stripeClient.paymentMethods.detach(currentPaymentMethodData.method);
    await PaymentMethodModel.deleteOne({
      _id: args.id
    });
    const userData = await UserModel.findById(userID);
    if (!userData) {
      throw new Error('cannot find user data');
    }
    if (userData.defaultPaymentMethod && userData.defaultPaymentMethod.equals(args.id)) {
      await UserModel.updateOne({
        _id: userID
      }, {
        $set: {
          defaultPaymentMethod: undefined
        }
      });
    }
    return `deleted payment method ${args.id.toHexString()}`;
  }
}

export default DeletePaymentMethodResolver;
