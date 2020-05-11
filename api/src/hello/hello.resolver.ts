import { Resolver, Query } from 'type-graphql';

@Resolver()
class HelloResolver {
  @Query(_returns => String)
  hello(): string {
    return 'Hello world! 🚀';
  }
}

export default HelloResolver;
