import { Resolver, Field, Args, Mutation, Ctx, ArgsType, Float } from 'type-graphql';
import { GraphQLContext } from '../utils/context';
import { verifyAdmin } from '../auth/checkAuth';
import { stripeClient, requirePaymentSystemInitialized } from '../stripe/init';
import { ObjectId } from 'mongodb';
import Coupon, { CouponModel } from '../schema/payments/coupon';

@ArgsType()
export class AddCouponArgs {
  @Field({ description: 'coupon name' })
  name: string;

  @Field(_type => Float, { description: 'amount off for coupon' })
  amount: number;

  @Field({ description: 'if percent off or not' })
  isPercent: boolean;
}

@Resolver()
class AddCouponResolver {
  @Mutation(_returns => String)
  async addCoupon(@Args() args: AddCouponArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    requirePaymentSystemInitialized();
    if (!verifyAdmin(ctx)) {
      throw new Error('user must be admin to add a coupon');
    }
    if (args.isPercent) {
      if (args.amount < 0 || args.amount > 100) {
        throw new Error(`percent off of ${args.amount} is invalid`);
      }
    } else {
      if (args.amount < 0) {
        throw new Error(`amount off of ${args.amount} is invalid`);
      }
      args.amount = Math.ceil(args.amount * 100);
    }
    const id = new ObjectId();
    await stripeClient.coupons.create({
      name: args.name,
      duration: 'repeating',
      metadata: {
        id: id.toHexString()
      },
      amount_off: args.isPercent ? undefined : args.amount,
      percent_off: args.isPercent ? args.amount : undefined
    });
    const newCoupon: Coupon = {
      _id: new ObjectId(),
      ...args
    };
    await new CouponModel(newCoupon).save();
    return `added coupon ${newCoupon.name}`;
  }
}

export default AddCouponResolver;
