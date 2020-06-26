import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { elasticClient } from '../elastic/init';
import { folderIndexName } from '../elastic/settings';
import { ObjectId } from 'mongodb';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/auth/user';
import { checkRepositoryAccess } from '../repositories/auth';
import { AccessLevel } from '../schema/auth/access';
import { FolderModel, FolderDB } from '../schema/structure/folder';
import { FileDB, FileModel } from '../schema/structure/file';
import { deleteFilesUtil } from '../files/deleteFiles.resolver';
import { baseFolderPath, baseFolderName } from './shared';

@ArgsType()
class DeleteFolderArgs {
  @Field(_type => ObjectId, { description: 'folder id' })
  id: ObjectId;
  @Field(_type => String, { description: 'branch name' })
  branch: string;
}

export const deleteFolderUtil = async (folder: FolderDB, branch: string): Promise<void> => {
  // deletes single folder (no children)
  if (!folder.branches.includes(branch)) {
    throw new Error(`folder is not in branch ${branch}`);
  }
  if (folder.branches.length === 1) {
    await elasticClient.delete({
      index: folderIndexName,
      id: folder._id.toHexString()
    });
    await FolderModel.deleteOne({
      _id: folder._id
    });
  } else {
    const currentTime = new Date().getTime();
    await elasticClient.update({
      index: folderIndexName,
      id: folder._id.toHexString(),
      body: {
        script: {
          source: `
            ctx._source.branches.remove(params.branch);
            ctx._source.numBranches--;
            ctx._source.updated = params.currentTime;
          `,
          lang: 'painless',
          params: {
            branch,
            currentTime
          }
        }
      }
    });
    await FolderModel.updateOne({
      _id: folder._id
    }, {
      $pull: {
        branches: branch
      }
    });
  }
};

export const deleteFolderRecursiveUtil = async (folder: FolderDB, branch: string): Promise<void> => {
  // deletes folder by deleting children
  // does not delete base folder. this can only be done if deleting the repository
  if (!folder.branches.includes(branch)) {
    throw new Error(`folder is not in branch ${branch}`);
  }
  if (folder.name === baseFolderName && folder.path === baseFolderPath) {
    throw new Error('cannot delete base folder');
  }
  const remainingFolders: ObjectId[] = [folder._id];
  const childFiles: FileDB[] = [];
  while (remainingFolders.length > 0) {
    const currentFolderID = remainingFolders.pop();
    childFiles.concat(await FileModel.find({
      folder: currentFolderID,
      repository: folder.repository,
      branches: {
        $all: [branch]
      }
    }));
    const childFolders = await FolderModel.find({
      parent: currentFolderID,
      repository: folder.repository,
      branches: {
        $all: [branch]
      }
    });
    if (childFolders) {
      childFolders.map(childFolder => remainingFolders.push(childFolder._id));
    }
  }
  await deleteFilesUtil(folder.repository, branch, childFiles);
};

@Resolver()
class DeleteFolderResolver {
  @Mutation(_returns => String)
  async deleteFolder(@Args() args: DeleteFolderArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const folder = await FolderModel.findById(args.id);
    if (!folder) {
      throw new Error(`cannot find folder with id ${args.id.toHexString()}`);
    }
    const userID = new ObjectId(ctx.auth.id);
    const user = await UserModel.findById(userID);
    if (!user) {
      throw new Error('cannot find user data');
    }
    if (!(await checkRepositoryAccess(user, folder.repository, AccessLevel.edit))) {
      throw new Error('user does not have edit permissions for project or repository');
    }
    await deleteFolderRecursiveUtil(folder, args.branch);
    return `deleted folder with id: ${args.id}`;
  }
}

export default DeleteFolderResolver;
