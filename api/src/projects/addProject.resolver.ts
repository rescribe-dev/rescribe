import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { projectIndexName } from '../elastic/settings';
import { elasticClient } from '../elastic/init';
import { ObjectId } from 'mongodb';
import { Project, BaseProject, ProjectDB, ProjectModel } from '../schema/structure/project';
import { verifyLoggedIn } from '../auth/checkAuth';
import { GraphQLContext } from '../utils/context';
import Access, { AccessLevel, AccessType } from '../schema/auth/access';
import { UserModel } from '../schema/auth/user';
import { countProjects } from './projectNameExists.resolver';
import { Matches } from 'class-validator';
import { validProjectName } from '../utils/variables';
@ArgsType()
class AddProjectArgs {
  @Field(_type => String, { description: 'project name' })
  @Matches(validProjectName, {
    message: 'invalid characters provided for project name'
  })
  name: string;
}

@Resolver()
class AddProjectResolver {
  @Mutation(_returns => String)
  async addProject(@Args() args: AddProjectArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const userID = new ObjectId(ctx.auth.id);
    if ((await countProjects(userID, args.name)) > 0) {
      throw new Error('project already exists');
    }
    const id = new ObjectId();
    const currentTime = new Date().getTime();
    const baseProject: BaseProject = {
      name: args.name,
      repositories: [],
      created: currentTime,
      updated: currentTime,
    };
    const elasticProject: Project = {
      ...baseProject
    };
    await elasticClient.index({
      id: id.toHexString(),
      index: projectIndexName,
      body: elasticProject
    });
    const projectAccess : Access = {
      _id: id,  
      level: AccessLevel.owner,
      type: AccessType.user
    };
    await UserModel.updateOne({
      _id: userID,
    }, {
      $addToSet: {
        projects : projectAccess
      }
    });
    const dbProject: ProjectDB = {
      ...baseProject,
      _id: id
    };
    await new ProjectModel(dbProject).save();
    return `indexed project with id ${id.toHexString()}`;
  }
}

export default AddProjectResolver;
