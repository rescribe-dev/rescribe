/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query, Field, Ctx } from 'type-graphql';
import { elasticClient } from '../elastic/init';
import { repositoryIndexName } from '../elastic/settings';
import { ObjectId } from 'mongodb';
import { Repository } from '../schema/repository';
import { RequestParams } from '@elastic/elasticsearch';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/user';
import { AccessLevel } from '../schema/access';
import { TermQuery } from '../elastic/types';
import { GraphQLContext } from '../utils/context';
import { checkProjectAccess } from '../projects/auth';

@ArgsType()
class RepositoriesArgs {
  @Field(_type => ObjectId, { description: 'project id', nullable: true })
  project?: ObjectId;
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
    const mustParams: TermQuery[] = [];
    const shouldParams: TermQuery[] = [];
    if (!args.project) {
      for (const projectID of user.projects) {
        shouldParams.push({
          term: {
            project: projectID._id.toHexString()
          }
        });
      }
      for (const repositoryID of user.repositories) {
        shouldParams.push({
          term: {
            _id: repositoryID._id.toHexString()
          }
        });
      }
    } else {
      if (!checkProjectAccess(user, args.project, AccessLevel.view)) {
        throw new Error('user does not have view access to project');
      }
      mustParams.push({
        term: {
          project: args.project.toHexString()
        }
      });
    }
    const searchParams: RequestParams.Search = {
      index: repositoryIndexName,
      body: {
        query: {
          bool: {
            filter: {
              bool: {
                must: mustParams,
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
