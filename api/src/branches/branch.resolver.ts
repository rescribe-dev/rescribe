/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query, Field, Ctx } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { Branch } from '../schema/structure/branch';
import { branchIndexName } from '../elastic/settings';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/auth/user';
import { elasticClient } from '../elastic/init';
import { checkRepositoryAccess } from '../repositories/auth';
import { AccessLevel } from '../schema/auth/access';
import { TermQuery } from '../elastic/types';

@ArgsType()
class BranchArgs {
  @Field(_type => ObjectId, { description: 'branch id', nullable: true })
  id?: ObjectId;

  @Field({ description: 'branch name', nullable: true })
  name?: string;

  @Field(_type => ObjectId, { description: 'repository id', nullable: true })
  repository?: ObjectId;
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
    let branch: Branch;
    if (args.id) {
      const branchData = await elasticClient.get({
        id: args.id.toHexString(),
        index: branchIndexName
      });
      branch = {
        ...branchData.body._source as Branch,
        _id: new ObjectId(branchData.body._id as string)
      };
    } else if (args.name && args.repository) {
      const shouldParams: TermQuery[] = [];
      for (const project of user.projects) {
        shouldParams.push({
          term: {
            project: project._id.toHexString()
          }
        });
      }
      for (const repository of user.repositories) {
        shouldParams.push({
          term: {
            repository: repository._id.toHexString()
          }
        });
      }
      const mustParams: TermQuery[] = [{
        term: {
          name: args.name
        }
      }, {
        term: {
          repository: args.repository.toHexString()
        }
      }];
      const branchData = await elasticClient.search({
        index: branchIndexName,
        body: {
          query: {
            bool: {
              should: shouldParams,
              must: mustParams
            }
          }
        }
      });
      if (branchData.body.hits.hits.length === 0) {
        throw new Error('could not find branch');
      }
      branch = {
        ...branchData.body.hits.hits[0]._source as Branch,
        _id: new ObjectId(branchData.body.hits.hits[0]._id as string)
      };
    } else {
      throw new Error('user must supply name or id');
    }
    if (!checkRepositoryAccess(user, branch.project, branch.repository, AccessLevel.view)) {
      throw new Error('user not authorized to view branch');
    }
    return branch;
  }
}

export default BranchResolver;
