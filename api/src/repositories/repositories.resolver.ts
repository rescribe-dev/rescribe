/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query, Field, Ctx } from 'type-graphql';
import { elasticClient } from '../elastic/init';
import { repositoryIndexName } from '../elastic/settings';
import { ObjectId } from 'mongodb';
import { Repository } from '../schema/structure/repository';
import { RequestParams } from '@elastic/elasticsearch';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/auth/user';
import { AccessLevel } from '../schema/auth/access';
import { TermQuery } from '../elastic/types';
import { GraphQLContext } from '../utils/context';
import { checkProjectAccess } from '../projects/auth';

@ArgsType()
class RepositoriesArgs {
  @Field(_type => [ObjectId], { description: 'project id', nullable: true })
  projects?: ObjectId[];
}

@Resolver()
class RepositoriesResolver {
  @Query(_returns => [Repository])
  async repositories(@Args() args: RepositoriesArgs, @Ctx() ctx: GraphQLContext): Promise<Repository[]> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const user = await UserModel.findById(ctx.auth.id);
    if (!user) {
      throw new Error('cannot find user');
    }
    const shouldParams: TermQuery[] = [];
    if (!args.projects || args.projects.length === 0) {
      if (user.repositories.length === 0 && user.projects.length === 0) {
        return [];
      }
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
            _id: repository._id.toHexString()
          }
        });
      }
    } else {
      for (const projectID of args.projects) {
        if (!checkProjectAccess(user, projectID, AccessLevel.view)) {
          throw new Error('user does not have view access to project');
        }
        shouldParams.push({
          term: {
            project: projectID.toHexString()
          }
        });
      }
    }
    const searchParams: RequestParams.Search = {
      index: repositoryIndexName,
      body: {
        query: {
          bool: {
            filter: {
              bool: {
                should: shouldParams
              }
            }
          }
        }
      }
    };
    const elasticRepositoryData = await elasticClient.search(searchParams);
    const result: Repository[] = [];
    for (const hit of elasticRepositoryData.body.hits.hits) {
      const currentRepository: Repository = {
        ...hit._source as Repository,
        _id: new ObjectId(hit._id as string)
      };
      result.push(currentRepository);
    }
    return result;
  }
}

export default RepositoriesResolver;
