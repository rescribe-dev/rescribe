/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query, Field, Ctx } from 'type-graphql';
import { Project, ProjectDB } from '../schema/structure/project';
import { ObjectId } from 'mongodb';
import { projectIndexName } from '../elastic/settings';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/auth/user';
import { elasticClient } from '../elastic/init';
import { checkProjectAccess } from './auth';
import { AccessLevel } from '../schema/auth/access';
import { TermQuery } from '../elastic/types';

@ArgsType()
class ProjectArgs {
  @Field(_type => ObjectId, { description: 'project id', nullable: true })
  id?: ObjectId;

  @Field({ description: 'project id', nullable: true })
  name?: string;
}

@Resolver()
class ProjectResolver {
  @Query(_returns => Project)
  async project(@Args() args: ProjectArgs, @Ctx() ctx: GraphQLContext): Promise<Project> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const userID = new ObjectId(ctx.auth.id);
    const user = await UserModel.findById(userID);
    if (!user) {
      throw new Error('cannot find user data');
    }
    let project: Project;
    if (args.id) {
      const projectData = await elasticClient.get({
        id: args.id.toHexString(),
        index: projectIndexName
      });
      project = {
        ...projectData.body._source as Project,
        _id: new ObjectId(projectData.body._id as string)
      };
    } else if (args.name) {
      const shouldParams: TermQuery[] = [];
      for (const project of user.projects) {
        shouldParams.push({
          term: {
            _id: project._id.toHexString()
          }
        });
      }
      const mustParams: TermQuery[] = [{
        term: {
          name: args.name
        }
      }];
      const projectData = await elasticClient.search({
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
      if (projectData.body.hits.hits.length === 0) {
        throw new Error('could not find project');
      }
      project = {
        ...projectData.body.hits.hits[0]._source as Project,
        _id: new ObjectId(projectData.body.hits.hits[0]._id as string)
      };
    } else {
      throw new Error('user must supply name or id');
    }
    if (!(await checkProjectAccess(user, project as ProjectDB, AccessLevel.view))) {
      throw new Error('user not authorized to view project');
    }
    return project;
  }
}

export default ProjectResolver;
