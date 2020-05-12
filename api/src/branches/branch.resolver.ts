/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { BranchModel, BranchDB } from '../schema/branch';

@ArgsType()
class BranchArgs {
  @Field(_type => ObjectId, { description: 'repository id' })
  repository: ObjectId;
  @Field({ description: 'branch name' })
  branch: string;
}

@Resolver()
class BranchResolver {
  @Query(_returns => BranchDB)
  async branch(@Args() args: BranchArgs): Promise<BranchDB> {
    const branchResult = await BranchModel.findOne({
      repository: args.repository,
      name: args.branch
    });
    if (!branchResult) {
      throw new Error('cannot find branch');
    }
    return branchResult;
  }
}

export default BranchResolver;
