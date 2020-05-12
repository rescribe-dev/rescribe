import { Resolver, ArgsType, Field, Args, Mutation } from 'type-graphql';
import { branchIndexName } from '../elastic/settings';
import { elasticClient } from '../elastic/init';
import { ObjectId } from 'mongodb';
import { Branch, BaseBranch, BranchDB, BranchModel } from '../schema/branch';
import { RepositoryModel } from '../schema/repository';

@ArgsType()
class AddBranchArgs {
  @Field(_type => String, { description: 'branch name' })
  name: string;
  @Field(_type => ObjectId, { description: 'repository d' })
  repository: ObjectId;
}

@Resolver()
class AddBranchResolver {
  @Mutation(_returns => String)
  async addBranch(@Args() args: AddBranchArgs): Promise<string> {
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
    return `indexed branch with id ${id.toHexString()}`;
  }
}

export default AddBranchResolver;
