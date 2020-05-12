import { Resolver, ArgsType, Field, Args, Mutation } from 'type-graphql';
import { logger } from '@typegoose/typegoose/lib/logSettings';
import { repositoryIndexName } from '../elastic/settings';
import { elasticClient } from '../elastic/init';
import { ObjectId } from 'mongodb';
import { RepositoryModel } from '../schema/repository';

@ArgsType()
class DeleteRepositoryArgs {
  @Field(_type => ObjectId, { description: 'repository id' })
  id: ObjectId;
}

@Resolver()
class DeleteRepositoryResolver {
  @Mutation(_returns => String)
  async deleteRepository(@Args() args: DeleteRepositoryArgs): Promise<string> {
    const id = new ObjectId();
    const deleteElasticResult = await elasticClient.delete({
      index: repositoryIndexName,
      id: args.id.toHexString()
    });
    logger.info(`deleted repository ${JSON.stringify(deleteElasticResult.body)}`);
    await RepositoryModel.deleteOne({
      _id: args.id
    });
    return `deleted repository with id: ${id}`;
  }
}

export default DeleteRepositoryResolver;
