import Product, { ProductModel } from '../schema/payments/product';
import { RedisKey, cache } from '../utils/redis';
import { configData } from '../utils/config';
import { Resolver, Query } from 'type-graphql';

const redisExpireSeconds = 60 * 20;

@Resolver()
class ProductResolver {
  @Query(_returns => [Product])
  async products(): Promise<Product[]> {
    const redisKeyObject: RedisKey = {
      path: '',
      type: 'products'
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
    const data = await ProductModel.find({});
    if (!data) {
      throw new Error('could not find products');
    }
    products = data;
    await cache.set(redisKey, JSON.stringify(products), 'ex', redisExpireSeconds);
    return products;
  }
}

export default ProductResolver;
