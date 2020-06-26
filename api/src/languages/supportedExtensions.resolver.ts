import { Resolver, Query } from 'type-graphql';

export const supportedExtensions = ['.java'];

@Resolver()
class SupportedExtensionsResolver {
  @Query(_returns => [String])
  supportedExtensions(): string[] {
    return supportedExtensions;
  }
}

export default SupportedExtensionsResolver;
