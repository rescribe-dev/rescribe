import { ArgsType, Field, Args, Resolver, Query, Ctx } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { verifyAdmin, verifyLoggedIn } from '../../auth/checkAuth';
import { requirePaymentSystemInitialized } from '../../stripe/init';
import { GraphQLContext } from '../../utils/context';
import PaymentMethod, { PaymentMethodModel } from '../../schema/users/paymentMethod';

@ArgsType()
export class PaymentMethodsArgs {
  @Field(_type => ObjectId, { description: 'payment methods user', nullable: true })
  user?: ObjectId;
}

@Resolver()
class PaymentMethodsResolver {
  @Query(_returns => [PaymentMethod])
  async paymentMethods(@Args() args: PaymentMethodsArgs, @Ctx() ctx: GraphQLContext): Promise<PaymentMethod[]> {
    requirePaymentSystemInitialized();
    if (!verifyLoggedIn(ctx)) {
      throw new Error('user must be logged in');
    }
    let userID: ObjectId = new ObjectId(ctx.auth?.id);
    if (args.user) {
      if (!args.user.equals(userID) && !verifyAdmin(ctx)) {
        throw new Error('only admins can view payment methods for specific users');
      }
      userID = args.user;
    }
    const paymentMethodsData = await PaymentMethodModel.find({
      user: userID
    });
    return paymentMethodsData;
  }
}

export default PaymentMethodsResolver;
