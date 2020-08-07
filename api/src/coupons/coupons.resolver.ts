import { Resolver, Query, Ctx } from 'type-graphql';
import Coupon, { CouponModel } from '../schema/payments/coupon';
import { requirePaymentSystemInitialized } from '../stripe/init';
import { verifyAdmin } from '../auth/checkAuth';
import { GraphQLContext } from '../utils/context';

@Resolver()
class CouponsResolver {
  @Query(_returns => [Coupon])
  async coupons(@Ctx() ctx: GraphQLContext): Promise<Coupon[]> {
    requirePaymentSystemInitialized();
    if (!verifyAdmin(ctx)) {
      throw new Error('user must be admin to get list of coupons');
    }
    const coupons = await CouponModel.find({});
    return coupons;
  }
}

export default CouponsResolver;
