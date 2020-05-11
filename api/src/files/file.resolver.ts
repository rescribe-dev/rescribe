import { Resolver, ArgsType, Field, Args, Mutation } from 'type-graphql';
import File from '../schema/file';

@ArgsType()
class FileArgs {
  @Field(_type => String, { description: 'file id' })
  id: string;
}

@Resolver()
class FileResolver {
  @Mutation(_returns => File)
  async file(@Args() _args: FileArgs): Promise<File> {
    throw new Error('not implemented');
  }
}

export default FileResolver;
