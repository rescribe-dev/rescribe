import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { FolderModel, FolderDB } from '../schema/structure/folder';
import { FileDB, FileModel } from '../schema/structure/file';
import { deleteFilesUtil, saveAggregates } from '../files/deleteFiles.resolver';
import { baseFolderPath, baseFolderName } from '../shared/folders';
import { getFolder, FolderArgs } from './folder.resolver';
import { UserModel } from '../schema/auth/user';
import { checkRepositoryAccess } from '../repositories/auth';
import { AccessLevel } from '../schema/auth/access';
import { RepositoryModel } from '../schema/structure/repository';
import { Aggregates } from '../files/shared';

@ArgsType()
class DeleteFolderArgs extends FolderArgs {
  @Field(_type => String, { description: 'branch name' })
  branch: string;
}

export const deleteFolderRecursiveUtil = async (folder: FolderDB, branch: string, aggregates: Aggregates): Promise<void> => {
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
  await deleteFilesUtil({
    repository: folder.repository,
    branch,
    files: childFiles,
    aggregates
  });
};

@Resolver()
class DeleteFolderResolver {
  @Mutation(_returns => String)
  async deleteFolder(@Args() args: DeleteFolderArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const userID = new ObjectId(ctx.auth.id);
    const user = await UserModel.findById(userID);
    if (!user) {
      throw new Error('cannot find user data');
    }
    const folder = await getFolder(args);
    const repositoryID = new ObjectId(folder.repository);
    const repository = await RepositoryModel.findById(repositoryID);
    if (!repository) {
      throw new Error(`cannot find repository with id ${repositoryID.toHexString()}`);
    }
    if (!(await checkRepositoryAccess(user, repository, AccessLevel.view))) {
      throw new Error('user not authorized to view folder');
    }
    const aggregates: Aggregates = {
      linesOfCode: repository.linesOfCode,
      numberOfFiles: repository.numberOfFiles
    };
    await deleteFolderRecursiveUtil(folder, args.branch, aggregates);
    await saveAggregates(aggregates, repository._id);
    return `deleted folder with id: ${args.id}`;
  }
}

export default DeleteFolderResolver;
