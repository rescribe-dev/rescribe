import { Resolver, ArgsType, Field, Args, Mutation } from 'type-graphql';

@ArgsType()
class DeleteFileArgs {
  @Field(_type => String, { description: 'file id' })
  id: string;
}

@Resolver()
class DeleteFileResolver {
  @Mutation(_returns => String)
  deleteFile(@Args() _args: DeleteFileArgs): string {
    return 'not implemented';
  }
}

export default DeleteFileResolver;
