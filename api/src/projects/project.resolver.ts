/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query, Field, Ctx } from 'type-graphql';
import { Project } from '../schema/project';
import { ObjectId } from 'mongodb';
import { projectIndexName } from '../elastic/settings';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/user';
import { elasticClient } from '../elastic/init';
import { checkProjectAccess } from './auth';
import { AccessLevel } from '../schema/access';

@ArgsType()
class ProjectArgs {
  @Field(_type => ObjectId, { description: 'project id' })
  id: ObjectId;
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
    const projectData = await elasticClient.get({
      id: args.id.toHexString(),
      index: projectIndexName
    });
    const project: Project = {
      ...projectData.body._source as Project,
      _id: new ObjectId(projectData.body._id as string)
    };
    if (!checkProjectAccess(user, args.id, AccessLevel.view)) {
      throw new Error('user not authorized to view project');
    }
    return project;
  }
}

export default ProjectResolver;
