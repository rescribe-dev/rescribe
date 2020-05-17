import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { repositoryIndexName } from '../elastic/settings';
import { elasticClient } from '../elastic/init';
import { ObjectId } from 'mongodb';
import { RepositoryModel, RepositoryDB } from '../schema/structure/repository';
import { getLogger } from 'log4js';
import { verifyLoggedIn } from '../auth/checkAuth';
import { GraphQLContext } from '../utils/context';
import { checkRepositoryAccess } from './auth';
import { AccessLevel } from '../schema/auth/access';
import { UserModel } from '../schema/auth/user';
import { deleteBranchUtil } from '../branches/deleteBranch.resolver';
import { BranchModel } from '../schema/structure/branch';

@ArgsType()
class DeleteRepositoryArgs {
  @Field(_type => ObjectId, { description: 'repository id' })
  id: ObjectId;
}

const logger = getLogger();

export const deleteRepositoryUtil = async (args: DeleteRepositoryArgs, userID: ObjectId, repository: RepositoryDB): Promise<void> => {
  const deleteElasticResult = await elasticClient.delete({
    index: repositoryIndexName,
    id: args.id.toHexString()
  });
  logger.info(`deleted repository ${JSON.stringify(deleteElasticResult.body)}`);
  await RepositoryModel.deleteOne({
    _id: args.id
  });
  await UserModel.updateOne({
    _id: userID
  }, {
    $pull: {
      repositories: {
        _id: args.id
      }
    }
  });
  for (const branch of repository.branches) {
    const branchID = await BranchModel.findById(branch);
    if (!branchID) continue;
    await deleteBranchUtil({ id: branch }, branchID);
  }
};

@Resolver()
class DeleteRepositoryResolver {
  @Mutation(_returns => String)
  async deleteRepository(@Args() args: DeleteRepositoryArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const repository = await RepositoryModel.findById(args.id);
    if (!repository) {
      throw new Error(`cannot find repository with id ${args.id.toHexString()}`);
    }
    const userID = new ObjectId(ctx.auth.id);
    const user = await UserModel.findById(userID);
    if (!user) {
      throw new Error('cannot find user data');
    }
    if (!checkRepositoryAccess(user, repository.project, repository._id, AccessLevel.admin)) {
      throw new Error('user does not have admin permissions for project or repository');
    }
    await deleteRepositoryUtil(args, userID, repository);
    return `deleted repository with id: ${args.id.toHexString()}`;
  }
}

export default DeleteRepositoryResolver;
