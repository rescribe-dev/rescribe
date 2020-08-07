import { ArgsType, Field, Args, Resolver, Query, Ctx } from 'type-graphql';
import Coupon, { CouponModel } from '../schema/payments/coupon';
import { requirePaymentSystemInitialized } from '../stripe/init';
import { verifyAdmin } from '../auth/checkAuth';
import { GraphQLContext } from '../utils/context';
import { verifyRecaptcha } from '../utils/recaptcha';

@ArgsType()
export class CouponArgs {
  @Field(_type => String, { description: 'coupon name' })
  name: string;

  @Field(_type => String, { description: 'recaptcha token', nullable: true })
  recaptchaToken?: string;
}

@Resolver()
class CouponResolver {
  @Query(_returns => Coupon)
  async coupon(@Args() args: CouponArgs, @Ctx() ctx: GraphQLContext): Promise<Coupon> {
    requirePaymentSystemInitialized();
    if (!verifyAdmin(ctx)) {
      if (!args.recaptchaToken) {
        throw new Error('if not admin, recaptcha token required');
      }
      if (!(await verifyRecaptcha(args.recaptchaToken))) {
        throw new Error('invalid recaptcha token');
      }
    }
    const couponData = await CouponModel.findOne({
      name: args.name
    });
    if (!couponData) {
      throw new Error(`cannot find coupon with secret ${args.name}`);
    }
    return couponData;
  }
}

export default CouponResolver;
