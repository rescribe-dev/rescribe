import { Resolver, ArgsType, Field, Args, Mutation } from 'type-graphql';
import { logger } from '@typegoose/typegoose/lib/logSettings';
import { projectIndexName } from '../elastic/settings';
import { elasticClient } from '../elastic/init';
import { ObjectId } from 'mongodb';
import { Project, BaseProject, ProjectDB, ProjectModel } from '../schema/project';

@ArgsType()
class AddProjectArgs {
  @Field(_type => String, { description: 'project name' })
  name: string;
}

@Resolver()
class AddProjectResolver {
  @Mutation(_returns => String)
  async addProject(@Args() args: AddProjectArgs): Promise<string> {
    const id = new ObjectId();
    const currentTime = new Date().getTime();
    const baseProject: BaseProject = {
      name: args.name,
      repositories: []
    };
    const elasticProject: Project = {
      created: currentTime,
      updated: currentTime,
      ...baseProject
    };
    const indexResult = await elasticClient.index({
      id: id.toHexString(),
      index: projectIndexName,
      body: elasticProject
    });
    logger.info(`got add project result of ${JSON.stringify(indexResult.body)}`);
    const dbProject: ProjectDB = {
      ...baseProject,
      _id: id
    };
    await new ProjectModel(dbProject).save();
    return `indexed project with id ${id.toHexString()}`;
  }
}

export default AddProjectResolver;
