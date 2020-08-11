import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { FileModel, FileDB } from '../schema/structure/file';
import { elasticClient } from '../elastic/init';
import { fileIndexName, folderIndexName } from '../elastic/settings';
import { ObjectId } from 'mongodb';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/users/user';
import { checkRepositoryAccess } from '../repositories/auth';
import { AccessLevel } from '../schema/users/access';
import { s3Client, fileBucket, getFileKey } from '../utils/aws';
import { countFiles } from '../folders/countFiles.resolver';
import { FolderModel, FolderDB } from '../schema/structure/folder';
import { RepositoryModel } from '../schema/structure/repository';
import { Aggregates } from './shared';
import { saveAggregates } from './deleteFiles.resolver';

@ArgsType()
class DeleteFileArgs {
  @Field(_type => ObjectId, { description: 'file id' })
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

export const deleteFileUtil = async (file: FileDB, branch: string, aggregates: Aggregates): Promise<void> => {
  if (!file.branches.includes(branch)) {
    throw new Error(`file is not in branch ${branch}`);
  }
  if (file.branches.length === 1) {
    await elasticClient.delete({
      index: fileIndexName,
      id: file._id.toHexString()
    });
    aggregates.linesOfCode -= file.fileLength;
    aggregates.numberOfFiles--;
    await saveAggregates(aggregates, file.repository);
  } else {
    const currentTime = new Date().getTime();
    await elasticClient.update({
      index: fileIndexName,
      id: file._id.toHexString(),
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
  }
  await FileModel.deleteOne({
    _id: file._id
  });
  await s3Client.deleteObject({
    Bucket: fileBucket,
    Key: getFileKey(file.repository, file._id),
  }).promise();
  if (file.folder) {
    if ((await countFiles(file.repository, file.folder, branch)) === 0) {
      const folder = await FolderModel.findById(file.folder);
      if (!folder) {
        throw new Error(`cannot find folder with id ${file.folder.toHexString()}`);
      }
      // do not delete folder recursively
      await deleteFolderUtil(folder, branch);
    }
  }
};

@Resolver()
class DeleteFileResolver {
  @Mutation(_returns => String)
  async deleteFile(@Args() args: DeleteFileArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const file = await FileModel.findById(args.id);
    if (!file) {
      throw new Error(`cannot find file with id ${args.id.toHexString()}`);
    }
    const userID = new ObjectId(ctx.auth.id);
    const user = await UserModel.findById(userID);
    if (!user) {
      throw new Error('cannot find user data');
    }
    const repository = await RepositoryModel.findById(file.repository);
    if (!repository) {
      throw new Error(`cannot find repository with id ${file.repository.toHexString()}`);
    }
    if (!(await checkRepositoryAccess(user, file.repository, AccessLevel.edit))) {
      throw new Error('user does not have edit permissions for repository');
    }
    await deleteFileUtil(file, args.branch, {
      linesOfCode: repository.linesOfCode,
      numberOfFiles: repository.numberOfFiles
    });
    return `deleted file with id: ${args.id}`;
  }
}

export default DeleteFileResolver;
