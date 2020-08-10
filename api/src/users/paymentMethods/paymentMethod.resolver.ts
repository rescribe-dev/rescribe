import { ArgsType, Field, Args, Resolver, Query, Ctx } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { verifyLoggedIn } from '../../auth/checkAuth';
import { requirePaymentSystemInitialized } from '../../stripe/init';
import { GraphQLContext } from '../../utils/context';
import PaymentMethod, { PaymentMethodModel } from '../../schema/users/paymentMethod';

@ArgsType()
export class PaymentMethodsArgs {
  @Field(_type => ObjectId, { description: 'payment method id' })
  id: ObjectId;
}

@Resolver()
class PaymentMethodResolver {
  @Query(_returns => PaymentMethod)
  async paymentMethod(@Args() args: PaymentMethodsArgs, @Ctx() ctx: GraphQLContext): Promise<PaymentMethod> {
    requirePaymentSystemInitialized();
    if (!verifyLoggedIn(ctx)) {
      throw new Error('user must be logged in');
    }
    const paymentMethodData = await PaymentMethodModel.findById(args.id);
    if (!paymentMethodData) {
      throw new Error(`cannot find payment method with id ${args.id}`);
    }
    return paymentMethodData;
  }
}

export default PaymentMethodResolver;
