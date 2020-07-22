import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { elasticClient } from '../elastic/init';
import { ObjectId } from 'mongodb';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/auth/user';
import { checkRepositoryAccess } from '../repositories/auth';
import { AccessLevel } from '../schema/auth/access';
import { RepositoryModel, RepositoryDB } from '../schema/structure/repository';
import { repositoryIndexName } from '../elastic/settings';
import { deleteFilesUtil } from '../files/deleteFiles.resolver';
import { Aggregates } from '../files/shared';

@ArgsType()
class DeleteBranchArgs {
  @Field(_type => ObjectId, { description: 'repository id' })
  repository: ObjectId;
  @Field(_type => String, { description: 'branch name' })
  name: string;
}

export const deleteBranchUtil = async (args: DeleteBranchArgs, repository: RepositoryDB): Promise<void> => {
  const aggregates: Aggregates = {
    linesOfCode: repository.linesOfCode,
    numberOfFiles: repository.numberOfFiles
  };
  await deleteFilesUtil({
    repository: args.repository,
    branch: args.name,
    aggregates
  });
  const currentTime = new Date().getTime();
  await elasticClient.update({
    index: repositoryIndexName,
    id: args.repository.toHexString(),
    body: {
      script: {
        source: `
          ctx._source.branches.remove(params.branch);
          ctx._source.updated = params.currentTime;
          ctx._source.linesOfCode = params.linesOfCode;
          ctx._source.numberOfFiles = params.numberOfFiles;
        `,
        lang: 'painless',
        params: {
          branch: args.name,
          currentTime,
          ...aggregates
        }
      }
    }
  });
  await RepositoryModel.updateOne({
    _id: args.repository
  }, {
    $pull: {
      branches: args.name
    },
    $set: {
      currentTime,
      ...aggregates
    }
  });
};

@Resolver()
class DeleteBranchResolver {
  @Mutation(_returns => String)
  async deleteBranch(@Args() args: DeleteBranchArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const userID = new ObjectId(ctx.auth.id);
    const user = await UserModel.findById(userID);
    if (!user) {
      throw new Error('cannot find user data');
    }
    const repository = await RepositoryModel.findById(args.repository);
    if (!repository) {
      throw new Error(`cannot find repository with id ${args.repository.toHexString()}`);
    }
    if (!(await checkRepositoryAccess(user, repository, AccessLevel.edit))) {
      throw new Error('user does not have edit permissions for repository');
    }
    if (!repository.branches.includes(args.name)) {
      throw new Error(`cannot find branch with name ${args.name} on repository`);
    }
    await deleteBranchUtil(args, repository);
    return `deleted branch ${args.name}`;
  }
}

export default DeleteBranchResolver;
