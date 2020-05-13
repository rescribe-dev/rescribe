/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query, Field, Ctx } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { Branch } from '../schema/branch';
import { branchIndexName } from '../elastic/settings';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/user';
import { elasticClient } from '../elastic/init';
import { checkRepositoryAccess } from '../repositories/auth';
import { AccessLevel } from '../schema/access';

@ArgsType()
class BranchArgs {
  @Field(_type => ObjectId, { description: 'branch id' })
  id: ObjectId;
}

@Resolver()
class BranchResolver {
  @Query(_returns => Branch)
  async branch(@Args() args: BranchArgs, @Ctx() ctx: GraphQLContext): Promise<Branch> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const userID = new ObjectId(ctx.auth.id);
    const user = await UserModel.findById(userID);
    if (!user) {
      throw new Error('cannot find user data');
    }
    const branchData = await elasticClient.get({
      id: args.id.toHexString(),
      index: branchIndexName
    });
    const branch: Branch = {
      ...branchData.body._source as Branch,
      _id: new ObjectId(branchData.body._id as string)
    };
    if (!checkRepositoryAccess(user, branch.project, branch.repository, AccessLevel.view)) {
      throw new Error('user not authorized to view branch');
    }
    return branch;
  }
}

export default BranchResolver;
