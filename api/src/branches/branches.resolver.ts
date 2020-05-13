/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query } from 'type-graphql';
import { elasticClient } from '../elastic/init';
import { branchIndexName } from '../elastic/settings';
import { ObjectId } from 'mongodb';
import { Branch } from '../schema/branch';

@ArgsType()
class BranchesArgs {}

@Resolver()
class BranchesResolver {
  @Query(_returns => [Branch])
  async branches(@Args() _args: BranchesArgs): Promise<Branch[]> {
    const elasticBranchData = await elasticClient.search({
      index: branchIndexName,
      body: {
        query: {
          match_all: {}
        }
      }
    });
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
