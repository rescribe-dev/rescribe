/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query, Field, Ctx } from 'type-graphql';
import { elasticClient } from '../elastic/init';
import { branchIndexName } from '../elastic/settings';
import { ObjectId } from 'mongodb';
import { Branch } from '../schema/structure/branch';
import { RequestParams } from '@elastic/elasticsearch';
import { TermQuery } from '../elastic/types';
import { checkRepositoryAccess } from '../repositories/auth';
import { AccessLevel } from '../schema/auth/access';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/auth/user';

@ArgsType()
class BranchesArgs {
  @Field(_type => ObjectId, { description: 'repository id' })
  repository: ObjectId;

  @Field(_type => ObjectId, { description: 'project id' })
  project: ObjectId;
}

@Resolver()
class BranchesResolver {
  @Query(_returns => [Branch])
  async branches(@Args() args: BranchesArgs, @Ctx() ctx: GraphQLContext): Promise<Branch[]> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const user = await UserModel.findById(ctx.auth.id);
    if (!user) {
      throw new Error('cannot find user');
    }
    if (!(await checkRepositoryAccess(user, args.project, args.repository, AccessLevel.view))) {
      throw new Error('user does not have view access to repository');
    }
    const mustParams: TermQuery[] = [{
      term: {
        repository: args.repository.toHexString()
      }
    }];
    const searchParams: RequestParams.Search = {
      index: branchIndexName,
      body: {
        query: {
          bool: {
            must: mustParams
          }
        }
      }
    };
    const elasticBranchData = await elasticClient.search(searchParams);
    const result: Branch[] = [];
    for (const hit of elasticBranchData.body.hits.hits) {
      const currentBranch: Branch = {
        ...hit._source as Branch,
        _id: new ObjectId(hit._id as string)
      };
      result.push(currentBranch);
    }
    return result;
  }
}

export default BranchesResolver;
