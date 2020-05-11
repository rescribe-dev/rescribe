import { Resolver, ArgsType, Field, Args, Mutation } from 'type-graphql';
import { logger } from '@typegoose/typegoose/lib/logSettings';
import { projectIndexName } from '../elastic/settings';
import { elasticClient } from '../elastic/init';
import { ObjectId } from 'mongodb';
import { Project } from '../schema/structure';

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
    const project: Project = {
      created: currentTime,
      updated: currentTime,
      name: args.name,
      repositories: []
    };
    const indexResult = await elasticClient.index({
      id: id.toHexString(),
      index: projectIndexName,
      body: project
    });
    logger.info(`got add project result of ${JSON.stringify(indexResult.body)}`);
    return `indexed project with id ${id}`;
  }
}

export default AddProjectResolver;
