import { Resolver, Field, Args, Mutation, Ctx, ArgsType } from 'type-graphql';
import { GraphQLContext } from '../utils/context';
import { verifyAdmin } from '../auth/checkAuth';
import { stripeClient, requirePaymentSystemInitialized } from '../stripe/init';
import { CouponModel } from '../schema/payments/coupon';

@ArgsType()
export class DeleteCouponArgs {
  @Field({ description: 'coupon name' })
  name: string;
}

@Resolver()
class DeleteCouponResolver {
  @Mutation(_returns => String)
  async deleteCoupon(@Args() args: DeleteCouponArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    requirePaymentSystemInitialized();
    if (!verifyAdmin(ctx)) {
      throw new Error('user must be admin to delete a coupon');
    }
    await stripeClient.coupons.del(args.name);
    await CouponModel.deleteOne({
      name: args.name
    });
    return `deleted coupon ${args.name}`;
  }
}

export default DeleteCouponResolver;
