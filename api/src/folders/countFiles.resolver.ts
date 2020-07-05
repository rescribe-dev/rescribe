import { Resolver, ArgsType, Args, Query, Field, Ctx, Int } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { GraphQLContext } from '../utils/context';
import { FileModel } from '../schema/structure/file';

@ArgsType()
class CountFilesArgs {
  @Field({ description: 'repository' })
  repository: ObjectId;

  @Field({ description: 'folder' })
  folder: ObjectId;

  @Field({ description: 'branch' })
  branch: string;
}

export const countFiles = async (repositoryID: ObjectId, folderID: ObjectId, branch: string): Promise<number> => {
  return await FileModel.countDocuments({
    repository: repositoryID,
    branches: branch,
    folder: folderID
  });
};

@Resolver()
class CountFilesResolver {
  @Query(_returns => Int)
  async filesInFolder(@Args() args: CountFilesArgs, @Ctx() _ctx: GraphQLContext): Promise<number> {
    return await countFiles(args.repository, args.folder, args.branch);
  }
}

export default CountFilesResolver;
