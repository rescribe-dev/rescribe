import { Resolver, ArgsType, Field, Args, Mutation } from 'type-graphql';
import { logger } from '@typegoose/typegoose/lib/logSettings';
import { projectIndexName } from '../elastic/settings';
import { elasticClient } from '../elastic/init';
import { ObjectId } from 'mongodb';
import { ProjectModel } from '../schema/project';

@ArgsType()
class DeleteProjectArgs {
  @Field(_type => ObjectId, { description: 'project id' })
  id: ObjectId;
}

@Resolver()
class DeleteProjectResolver {
  @Mutation(_returns => String)
  async deleteProject(@Args() args: DeleteProjectArgs): Promise<string> {
    const id = new ObjectId();
    const deleteElasticResult = await elasticClient.delete({
      index: projectIndexName,
      id: args.id.toHexString()
    });
    logger.info(`deleted project ${JSON.stringify(deleteElasticResult.body)}`);
    await ProjectModel.deleteOne({
      _id: args.id
    });
    return `deleted project with id: ${id}`;
  }
}

export default DeleteProjectResolver;
