/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, Query, Ctx } from 'type-graphql';
import { elasticClient } from '../elastic/init';
import { projectIndexName } from '../elastic/settings';
import { ObjectId } from 'mongodb';
import { Project } from '../schema/project';
import { RequestParams } from '@elastic/elasticsearch';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/user';
import { TermQuery } from '../elastic/types';

@Resolver()
class ProjectsResolver {
  @Query(_returns => [Project])
  async projects(@Ctx() ctx: GraphQLContext): Promise<Project[]> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const user = await UserModel.findById(ctx.auth.id);
    if (!user) {
      throw new Error('cannot find user');
    }
    const shouldParams: TermQuery[] = [];
    for (const projectID of user.projects) {
      shouldParams.push({
        term: {
          _id: projectID._id.toHexString()
        }
      });
    }
    const searchParams: RequestParams.Search = {
      index: projectIndexName,
      body: {
        query: {
          bool: {
            should: shouldParams
          }
        }
      }
    };
    const elasticProjectData = await elasticClient.search(searchParams);
    const result: Project[] = [];
    for (const hit of elasticProjectData.body.hits.hits) {
      const currentProject: Project = {
        ...hit._source as Project,
        _id: new ObjectId(hit._id as string)
      };
      result.push(currentProject);
    }
    return result;
  }
}

export default ProjectsResolver;
