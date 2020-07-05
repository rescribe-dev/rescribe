import { Resolver, ArgsType, Args, Query, Field, Ctx } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/auth/user';
import { FileModel } from '../schema/structure/file';
import { checkRepositoryAccess, checkRepositoryPublic } from '../repositories/auth';
import { RepositoryModel } from '../schema/structure/repository';
import { AccessLevel } from '../schema/auth/access';

@ArgsType()
class FileExistsArgs {
  @Field({ description: 'file name' })
  name: string;

  @Field({ description: 'file path', nullable: true })
  path?: string;

  @Field({ description: 'file branch' })
  branch: string;

  @Field({ description: 'repository id' })
  repository: ObjectId;
}

export const countFiles = async (repository: ObjectId, branch: string, name: string, path?: string): Promise<number> => {
  return FileModel.countDocuments({
    name,
    repository,
    path,
    branches: branch
  });
};

@Resolver()
class FileNameExistsResolver {
  @Query(_returns => Boolean)
  async fileNameExists(@Args() args: FileExistsArgs, @Ctx() ctx: GraphQLContext): Promise<boolean> {
    const repositoryData = await RepositoryModel.findById(args.repository);
    if (!repositoryData) {
      throw new Error(`cannot find repository with id ${args.repository.toHexString()}`);
    }
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      if (!(await checkRepositoryPublic(repositoryData, AccessLevel.view))) {
        throw new Error('user must be logged in to view repository');
      }
    } else {
      const userID = new ObjectId(ctx.auth.id);
      const user = await UserModel.findById(userID);
      if (!user) {
        throw new Error('cannot find user data');
      }
      if (!(await checkRepositoryAccess(user, repositoryData, AccessLevel.view))) {
        throw new Error('user not authorized to view repository');
      }
    }
    return (await countFiles(repositoryData._id, args.branch, args.name, args.path)) > 0;
  }
}

export default FileNameExistsResolver;
