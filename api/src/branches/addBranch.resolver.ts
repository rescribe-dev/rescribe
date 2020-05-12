import { Resolver, ArgsType, Field, Args, Mutation } from 'type-graphql';
import { logger } from '@typegoose/typegoose/lib/logSettings';
import { branchIndexName } from '../elastic/settings';
import { elasticClient } from '../elastic/init';
import { ObjectId } from 'mongodb';
import { Branch, BaseBranch, BranchDB, BranchModel } from '../schema/branch';

@ArgsType()
class AddBranchArgs {
  @Field(_type => String, { description: 'project name' })
  name: string;
}

@Resolver()
class AddBranchResolver {
  @Mutation(_returns => String)
  async addBranch(@Args() args: AddBranchArgs): Promise<string> {
    const id = new ObjectId();
    const currentTime = new Date().getTime();
    const baseBranch: BaseBranch = {
      name: args.name,
      files: []
    };
    const elasticBranch: Branch = {
      created: currentTime,
      updated: currentTime,
      ...baseBranch
    };
    const indexResult = await elasticClient.index({
      id: id.toHexString(),
      index: branchIndexName,
      body: elasticBranch
    });
    logger.info(`got add branch result of ${JSON.stringify(indexResult.body)}`);
    const dbBranch: BranchDB = {
      ...baseBranch,
      _id: id
    };
    await new BranchModel(dbBranch).save();
    return `indexed branch with id ${id.toHexString()}`;
  }
}

export default AddBranchResolver;
