import { Resolver, ArgsType, Args, Query, Field, Ctx } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { GraphQLContext } from '../utils/context';
import { FolderDB, FolderModel } from '../schema/structure/folder';
import { getRepositoryByOwner } from '../repositories/repositoryNameExists.resolver';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/users/user';
import { checkRepositoryAccess, checkRepositoryPublic } from '../repositories/auth';
import { AccessLevel } from '../schema/users/access';

@ArgsType()
export class FolderArgs {
  @Field(_type => ObjectId, { description: 'folder id', nullable: true })
  id?: ObjectId;

  @Field({ description: 'folder name', nullable: true })
  name?: string;

  @Field({ description: 'folder path', nullable: true })
  path?: string;

  @Field({ description: 'folder branch', nullable: true })
  branch?: string;

  @Field(_type => ObjectId, { description: 'repository id', nullable: true })
  repositoryID?: ObjectId;

  @Field({ description: 'repository name', nullable: true })
  repository?: string;

  @Field({ description: 'owner name', nullable: true })
  owner?: string;
}

export const getFolder = async (args: FolderArgs): Promise<FolderDB> => {
  if (args.id) {
    const folder = await FolderModel.findById(args.id);
    if (!folder) {
      throw new Error('cannot find folder with given id');
    }
    return folder;
  }
  if (args.name !== undefined && args.path !== undefined
    && (args.repositoryID || (args.repository && args.owner))) {
    if (!args.repositoryID) {
      if (!args.repository || !args.owner) {
        throw new Error('repo or owner is undefined');
      }
      const repository = await getRepositoryByOwner(args.repository, args.owner);
      args.repositoryID = repository._id;
    }
    const folder = await FolderModel.findOne({
      repository: args.repositoryID,
      name: args.name,
      path: args.path
    });
    if (!folder) {
      throw new Error('cannot find folder with given name, path, and repository');
    }
    if (args.branch && !folder.branches.includes(args.branch)) {
      throw new Error(`folder does not exist on branch ${args.branch}`);
    }
    return folder;
  } else {
    throw new Error('invalid combination of parameters to get folder data');
  }
};

@Resolver()
class FolderResolver {
  @Query(_returns => FolderDB)
  async folder(@Args() args: FolderArgs, @Ctx() ctx: GraphQLContext): Promise<FolderDB> {
    const folder = await getFolder(args);
    if (!folder) {
      throw new Error('cannot find folder');
    }
    if (await checkRepositoryPublic(folder.repository, AccessLevel.view)) {
      return folder;
    } else if (verifyLoggedIn(ctx) && ctx.auth) {
      const userID = new ObjectId(ctx.auth.id);
      const user = await UserModel.findById(userID);
      if (!user) {
        throw new Error('cannot find user data');
      }
      if (!(await checkRepositoryAccess(user, new ObjectId(folder.repository), AccessLevel.view))) {
        throw new Error('user not authorized to view folder');
      }
      return folder;
    } else {
      throw new Error('user must be logged in to get private folder');
    }
  }
}

export default FolderResolver;
