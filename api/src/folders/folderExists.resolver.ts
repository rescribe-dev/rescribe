import { Resolver, ArgsType, Args, Query, Field, Ctx } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { GraphQLContext } from '../utils/context';
import { Matches } from 'class-validator';
import { validRepositoryName } from '../shared/variables';
import { FolderModel } from '../schema/structure/folder';
import { verifyLoggedIn } from '../auth/checkAuth';
import { getRepositoryByOwner } from '../repositories/repositoryNameExists.resolver';

@ArgsType()
class RepositoryExistsArgs {
  @Field({ description: 'repository name' })
  @Matches(validRepositoryName, {
    message: 'invalid characters provided for repository name'
  })
  repositoryName: string;

  @Field({ description: 'folder path' })
  path: string;

  @Field({ description: 'repository owner', nullable: true })
  owner?: string;
}

export const countFolders = async (repositoryID: ObjectId, path: string, name: string): Promise<number> => {
  return await FolderModel.countDocuments({
    repository: repositoryID,
    path,
    name
  });
};

@Resolver()
class FolderExistsResolver {
  @Query(_returns => Boolean)
  async folderExists(@Args() args: RepositoryExistsArgs, @Ctx() ctx: GraphQLContext): Promise<boolean> {
    if (!args.owner) {
      if (!verifyLoggedIn(ctx) || !ctx.auth) {
        throw new Error('user not logged in');
      }
      const userID = new ObjectId(ctx.auth.id);
      return (await countFolders(userID, args.path, args.repositoryName)) > 0;
    } else {
      const repository = await getRepositoryByOwner(args.owner, args.repositoryName);
      return (await countFolders(repository._id, args.path, args.repositoryName)) > 0;
    }
  }
}

export default FolderExistsResolver;
