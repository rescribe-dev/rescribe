/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query, Field, Ctx } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { projectIndexName } from '../elastic/settings';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/auth/user';
import { elasticClient } from '../elastic/init';
import { TermQuery } from '../elastic/types';
import { Matches } from 'class-validator';
import { validProjectName } from '../utils/variables';

@ArgsType()
class ProjectExistsArgs {
  @Field({ description: 'project name' })
  @Matches(validProjectName, {
    message: 'invalid characters provided for project name'
  })
  name: string;
}

interface CountResponse {
  count: number;
}

export const countProjects = async (userID: ObjectId, name?: string): Promise<number> => {
  const user = await UserModel.findById(userID);
  if (!user) {
    throw new Error('cannot find user data');
  }
  const shouldParams: TermQuery[] = [];
  for (const project of user.projects) {
    shouldParams.push({
      term: {
        _id: project._id.toHexString()
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
  const projectData = await elasticClient.count({
    index: projectIndexName,
    body: {
      query: {
        bool: {
          should: shouldParams,
          must: mustParams
        }
      }
    }
  });
  const countData = projectData.body as CountResponse;
  return countData.count;
};

@Resolver()
class ProjectNameExistsResolver {
  @Query(_returns => Boolean)
  async projectNameExists(@Args() args: ProjectExistsArgs, @Ctx() ctx: GraphQLContext): Promise<boolean> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const userID = new ObjectId(ctx.auth.id);
    return (await countProjects(userID, args.name)) > 0;
  }
}

export default ProjectNameExistsResolver;
