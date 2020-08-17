import Product, { ProductModel } from '../schema/payments/product';
import { RedisKey, cache } from '../utils/redis';
import { configData } from '../utils/config';
import { ArgsType, Field, Args, Resolver, Query } from 'type-graphql';
import { defaultProductName } from './defaults';

const redisExpireSeconds = 60 * 20;

@ArgsType()
export class ProductArgs {
  @Field(_type => String, { description: 'product name', nullable: true })
  name?: string;
}

export const getProduct = async (args: ProductArgs): Promise<Product> => {
  args.name = args.name ? args.name : defaultProductName;
  const redisKeyObject: RedisKey = {
    path: args.name,
    type: 'product'
  };
  const redisKey = JSON.stringify(redisKeyObject);
  const redisData = await cache.get(redisKey);
  let product: Product;
  if (redisData && !configData.DISABLE_CACHE) {
    const data = JSON.parse(redisData);
    if (!data) {
      throw new Error('cannot parse product from json');
    }
    product = data;
    return product;
  }
  const data = await ProductModel.findOne({
    name: args.name
  });
  if (!data) {
    throw new Error(`could not find product with name ${args.name}`);
  }
  product = data;
  await cache.set(redisKey, JSON.stringify(product), 'ex', redisExpireSeconds);
  return product;
};

@Resolver()
class ProductResolver {
  @Query(_returns => Product)
  async product(@Args() args: ProductArgs): Promise<Product> {
    return await getProduct(args);
  }
}

export default ProductResolver;
