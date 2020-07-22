import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { repositoryIndexName, fileIndexName } from '../elastic/settings';
import { elasticClient } from '../elastic/init';
import { ObjectId } from 'mongodb';
import { RepositoryModel } from '../schema/structure/repository';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { checkRepositoryAccess } from '../repositories/auth';
import { AccessLevel } from '../schema/auth/access';
import { UserModel } from '../schema/auth/user';

@ArgsType()
class AddBranchArgs {
  @Field(_type => String, { description: 'branch name' })
  name: string;
  @Field(_type => ObjectId, { description: 'repository id' })
  repository: ObjectId;
}

export const addBranchUtil = async (args: AddBranchArgs): Promise<void> => {
  const currentTime = new Date().getTime();
  await elasticClient.update({
    index: repositoryIndexName,
    id: args.repository.toHexString(),
    body: {
      script: { // first update
        source: `
          if (!ctx._source.branches.contains(params.branch)) {
            ctx._source.branches.add(params.branch);
            ctx._source.updated = params.currentTime;
          }
        `,
        lang: 'painless',
        params: {
          branch: args.name,
          currentTime
        }
      },
    }
  });
  await elasticClient.updateByQuery({
    index: fileIndexName,
    body: {
      script: {
        source: `
          if (!ctx._source.branches.contains(params.branch)) {
            ctx._source.branches.add(params.branch);
            ctx._source.numBranches++;
            ctx._source.updated = params.currentTime;
          }
        `,
        lang: 'painless',
        params: {
          branch: args.name,
          currentTime
        }
      },
      query: {
        match: {
          repository: args.repository.toHexString()
        }
      }
    }
  });
  await RepositoryModel.updateOne({
    _id: args.repository
  }, {
    $addToSet: {
      branches: args.name
    }
  });
};

@Resolver()
class AddBranchResolver {
  @Mutation(_returns => String)
  async addBranch(@Args() args: AddBranchArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const repository = await RepositoryModel.findById(args.repository);
    if (!repository) {
      throw new Error(`cannot find repository with id ${args.repository.toHexString()}`);
    }
    const userID = new ObjectId(ctx.auth.id);
    const user = await UserModel.findById(userID);
    if (!user) {
      throw new Error('cannot find user data');
    }
    if (repository.branches.includes(args.name)) {
      throw new Error(`repository already has branch named ${args.name}`);
    }
    if (!(await checkRepositoryAccess(user, repository, AccessLevel.admin))) {
      throw new Error('user does not have admin permissions for repository');
    }
    await addBranchUtil(args);
    return `added branch ${args.name}`;
  }
} 

export default AddBranchResolver;
