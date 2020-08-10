import { Resolver, ArgsType, Args, Query, Field, Ctx } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { projectIndexName } from '../elastic/settings';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/users/user';
import { elasticClient } from '../elastic/init';
import { TermQuery } from '../elastic/types';
import { Matches } from 'class-validator';
import { validProjectName } from '../shared/variables';
import { getUser } from '../users/shared';
import { ProjectModel } from '../schema/structure/project';

@ArgsType()
class ProjectExistsArgs {
  @Field({ description: 'project name' })
  @Matches(validProjectName, {
    message: 'invalid characters provided for project name'
  })
  name: string;

  @Field({ description: 'repository owner', nullable: true })
  owner?: string;
}

interface CountResponse {
  count: number;
}

/**
 * count the projects a user has access to
 * 
 * @param {ObjectId} userID given user
 * @param {string} name optional name to match project to
 * @returns {number} count projects
 */
export const countProjectsUserAccess = async (userID: ObjectId, name?: string): Promise<number> => {
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

/**
 * count projects owned by user
 * 
 * @param {ObjectId} owner user id
 * @param {string} name project name
 * @returns {number} number
 */
export const countProjects = async (owner: ObjectId, name: string): Promise<number> => {
  return ProjectModel.countDocuments({
    name,
    owner
  });
};

@Resolver()
class ProjectNameExistsResolver {
  @Query(_returns => Boolean)
  async projectNameExists(@Args() args: ProjectExistsArgs, @Ctx() ctx: GraphQLContext): Promise<boolean> {
    if (!args.owner) {
      if (!verifyLoggedIn(ctx) || !ctx.auth) {
        throw new Error('user not logged in');
      }
      const userID = new ObjectId(ctx.auth.id);
      return (await countProjectsUserAccess(userID, args.name)) > 0;
    } else {
      const ownerData = await getUser(args.owner);
      return (await countProjects(ownerData._id, args.name)) > 0;
    }
  }
}

export default ProjectNameExistsResolver;
