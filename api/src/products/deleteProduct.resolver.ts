import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { GraphQLContext } from '../utils/context';
import { verifyAdmin } from '../auth/checkAuth';
import { stripeClient, requirePaymentSystemInitialized } from '../stripe/init';
import { singlePurchase } from '../schema/payments/plan';
import Product, { ProductModel } from '../schema/payments/product';

@ArgsType()
export class DeleteProductArgs {
  @Field({ description: 'product name' })
  name: string;
}

export const deleteProductUtil = async (product: Product): Promise<void> => {
  for (const plan of product.plans) {
    if (plan.interval === singlePurchase) {
      continue;
    }
    for (const currency in plan.currencies) {
      await stripeClient.plans.del(plan.currencies[currency]);
    }
  }
  await stripeClient.products.del(product.stripeID);
};

@Resolver()
class DeleteProductResolver {
  @Mutation(_returns => String)
  async deleteProduct(@Args() args: DeleteProductArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    requirePaymentSystemInitialized();
    if (!verifyAdmin(ctx)) {
      throw new Error('user must be admin to delete a product');
    }
    const product = await ProductModel.findOne({
      name: args.name
    });
    if (!product) {
      throw new Error(`cannot find product with name ${args.name}`);
    }
    await deleteProductUtil(product);
    return `deleted product ${args.name}`;
  }
}

export default DeleteProductResolver;
