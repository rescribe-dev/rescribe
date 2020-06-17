/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query, Field, Ctx } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { repositoryIndexName } from '../elastic/settings';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import User, { UserModel } from '../schema/auth/user';
import { elasticClient } from '../elastic/init';
import { TermQuery } from '../elastic/types';
import { RequestParams } from '@elastic/elasticsearch';
import { NotEquals, Matches } from 'class-validator';
import { validRepositoryName } from '../utils/variables';

@ArgsType()
class RepositoryExistsArgs {
  @Field({ description: 'repository name' })
  @NotEquals('projects', { message: 'repository name cannot be projects' })
  @Matches(validRepositoryName, {
    message: 'invalid characters provided for repository name'
  })
  name: string;
}

interface CountResponse {
  count: number;
}

export const countRepositories = async (user: User, name?: string): Promise<number> => {
  const shouldParams: TermQuery[] = [];
  if (user.repositories.length === 0 && user.projects.length === 0) {
    return 0;
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
  const mustParams: TermQuery[] = [];
  if (name) {
    mustParams.push({
      term: {
        name: name.toLowerCase()
      }
    });
  }
  const searchParams: RequestParams.Search = {
    index: repositoryIndexName,
    body: {
      query: {
        bool: {
          must: mustParams,
          filter: {
            bool: {
              should: shouldParams
            }
          }
        }
      }
    }
  };
  const elasticRepositoryData = await elasticClient.count(searchParams);
  const countData = elasticRepositoryData.body as CountResponse;
  return countData.count;
};

@Resolver()
class RepositoryNameExistsResolver {
  @Query(_returns => Boolean)
  async repositoryNameExists(@Args() args: RepositoryExistsArgs, @Ctx() ctx: GraphQLContext): Promise<boolean> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const userID = new ObjectId(ctx.auth.id);
    const user = await UserModel.findById(userID);
    if (!user) {
      throw new Error('cannot find user');
    }
    return (await countRepositories(user, args.name)) > 0;
  }
}

export default RepositoryNameExistsResolver;
