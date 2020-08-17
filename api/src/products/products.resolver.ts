import Product, { ProductModel } from '../schema/payments/product';
import { RedisKey, cache } from '../utils/redis';
import { configData } from '../utils/config';
import { Resolver, Query, ArgsType, Args, Field } from 'type-graphql';

const redisExpireSeconds = 60 * 20;

@ArgsType()
class ProductsArgs {
  @Field(_type => [String], { description: 'product names', nullable: true })
  names?: string[];
}

@Resolver()
class ProductResolver {
  @Query(_returns => [Product])
  async products(@Args() args: ProductsArgs): Promise<Product[]> {
    const redisKeyObject: RedisKey = {
      path: 'products',
      type: args.names ? args.names.join(',') : ''
    };
    const redisKey = JSON.stringify(redisKeyObject);
    const redisData = await cache.get(redisKey);
    let products: Product[];
    if (redisData && !configData.DISABLE_CACHE) {
      const data = JSON.parse(redisData);
      if (!data) {
        throw new Error('cannot parse products from json');
      }
      products = data;
      return products;
    }
    const data = await ProductModel.find(!args.names ? {} : {
      name: {
        $in: args.names
      }
    });
    if (!data) {
      throw new Error('could not find products');
    }
    products = data;
    await cache.set(redisKey, JSON.stringify(products), 'ex', redisExpireSeconds);
    return products;
  }
}

export default ProductResolver;
