import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { FileModel, FileDB } from '../schema/structure/file';
import { elasticClient } from '../elastic/init';
import { fileIndexName } from '../elastic/settings';
import { ObjectId } from 'mongodb';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/auth/user';
import { checkRepositoryAccess } from '../repositories/auth';
import { AccessLevel } from '../schema/auth/access';
import { s3Client, fileBucket, getFileKey } from '../utils/aws';

@ArgsType()
class DeleteFileArgs {
  @Field(_type => ObjectId, { description: 'file id' })
  id: ObjectId;
  @Field(_type => String, { description: 'branch name' })
  branch: string;
}

export const deleteFileUtil = async (file: FileDB, branch: string, checkFolder: boolean): Promise<void> => {
  // TODO - replace with bulk request for deleting a bunch of files & folders
  await FileModel.deleteOne({
    _id: file._id
  });
  await s3Client.deleteObject({
    Bucket: fileBucket,
    Key: getFileKey(file.repository, branch, file.path, file.name),
  }).promise();
  if (checkFolder) {
    // TODO - delete parent folder if there are no files remaining
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
    if (!(await checkRepositoryAccess(user, file.repository, AccessLevel.edit))) {
      throw new Error('user does not have edit permissions for project or repository');
    }
    if (!file.branches.includes(args.branch)) {
      throw new Error(`file is not in branch ${args.branch}`);
    }
    if (file.branches.length === 1) {
      await elasticClient.delete({
        index: fileIndexName,
        id: file._id.toHexString()
      });
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
              branch: args.branch,
              currentTime
            }
          }
        }
      });
    }
    await deleteFileUtil(file, args.branch, true);
    return `deleted file with id: ${args.id}`;
  }
}

export default DeleteFileResolver;
