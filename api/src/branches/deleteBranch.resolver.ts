import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { elasticClient } from '../elastic/init';
import { ObjectId } from 'mongodb';
import { branchIndexName } from '../elastic/settings';
import { BranchModel, BranchDB } from '../schema/structure/branch';
import { getLogger } from 'log4js';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/auth/user';
import { checkRepositoryAccess } from '../repositories/auth';
import { AccessLevel } from '../schema/auth/access';
import { deleteFileUtil } from '../files/deleteFile.resolver';
import { FileModel } from '../schema/structure/file';

@ArgsType()
class DeleteBranchArgs {
  @Field(_type => ObjectId, { description: 'branch id' })
  id: ObjectId;
}

const logger = getLogger();

export const deleteBranchUtil = async (args: DeleteBranchArgs, branch: BranchDB): Promise<void> => {
  const deleteElasticResult = await elasticClient.delete({
    index: branchIndexName,
    id: args.id.toHexString()
  });
  logger.info(`deleted branch ${JSON.stringify(deleteElasticResult.body)}`);
  await BranchModel.deleteOne({
    _id: args.id
  });
  for (const fileID of branch.files) {
    const file = await FileModel.findById(fileID);
    if (!file) {
      throw new Error(`cannot find file with id ${fileID.toHexString()}`);
    }
    await deleteFileUtil(file);
  }
};

@Resolver()
class DeleteBranchResolver {
  @Mutation(_returns => String)
  async deleteBranch(@Args() args: DeleteBranchArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const branch = await BranchModel.findById(args.id);
    if (!branch) {
      throw new Error(`cannot find branch with id ${args.id.toHexString()}`);
    }
    const userID = new ObjectId(ctx.auth.id);
    const user = await UserModel.findById(userID);
    if (!user) {
      throw new Error('cannot find user data');
    }
    if (!(await checkRepositoryAccess(user, branch.project, branch.repository, AccessLevel.edit))) {
      throw new Error('user does not have edit permissions for project or repository');
    }
    await deleteBranchUtil(args, branch);
    return `deleted branch with id: ${args.id}`;
  }
}

export default DeleteBranchResolver;
