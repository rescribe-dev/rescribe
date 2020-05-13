import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { branchIndexName } from '../elastic/settings';
import { elasticClient } from '../elastic/init';
import { ObjectId } from 'mongodb';
import { Branch, BaseBranch, BranchDB, BranchModel } from '../schema/branch';
import { RepositoryModel } from '../schema/repository';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { ProjectModel } from '../schema/project';
import { checkRepositoryAccess } from '../repositories/auth';
import { AccessLevel } from '../schema/access';

@ArgsType()
class AddBranchArgs {
  @Field(_type => String, { description: 'branch name' })
  name: string;
  @Field(_type => ObjectId, { description: 'repository id' })
  repository: ObjectId;
}

export const addBranchUtil = async (args: AddBranchArgs): Promise<ObjectId> => {
  const currentTime = new Date().getTime();
    const baseBranch: BaseBranch = {
      name: args.name,
      files: [],
      repository: args.repository
    };
    const elasticBranch: Branch = {
      created: currentTime,
      updated: currentTime,
      ...baseBranch
    };
    const id = new ObjectId();
    await elasticClient.index({
      id: id.toHexString(),
      index: branchIndexName,
      body: elasticBranch
    });
    await RepositoryModel.updateOne({
      _id: args.repository
    }, {
      $addToSet: {
        branches: id
      }
    });
    const dbBranch: BranchDB = {
      ...baseBranch,
      _id: id
    };
    await new BranchModel(dbBranch).save();
    return id;
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
    const project = await ProjectModel.findById(repository.project);
    if (!project) {
      throw new Error('cannot find parent project');
    }
    const userID = new ObjectId(ctx.auth.id);
    if (!checkRepositoryAccess(userID, repository, project, AccessLevel.admin)) {
      throw new Error('user does not have admin permissions for project or repository');
    }
    const id = await addBranchUtil(args);
    return `indexed branch with id ${id.toHexString()}`;
  }
}

export default AddBranchResolver;
