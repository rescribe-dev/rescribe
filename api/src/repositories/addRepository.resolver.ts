import { Resolver, ArgsType, Field, Args, Mutation } from 'type-graphql';
import { logger } from '@typegoose/typegoose/lib/logSettings';
import { repositoryIndexName } from '../elastic/settings';
import { elasticClient } from '../elastic/init';
import { ObjectId } from 'mongodb';
import { Repository, BaseRepository, RepositoryDB, RepositoryModel } from '../schema/repository';

@ArgsType()
class AddRepositoryArgs {
  @Field(_type => String, { description: 'repository name' })
  name: string;
}

@Resolver()
class AddRepositoryResolver {
  @Mutation(_returns => String)
  async addRepository(@Args() args: AddRepositoryArgs): Promise<string> {
    const id = new ObjectId();
    const currentTime = new Date().getTime();
    const baseRepository: BaseRepository = {
      name: args.name,
      branches: [],
      project: new ObjectId()
    };
    const elasticRepository: Repository = {
      created: currentTime,
      updated: currentTime,
      ...baseRepository
    };
    const indexResult = await elasticClient.index({
      id: id.toHexString(),
      index: repositoryIndexName,
      body: elasticRepository
    });
    logger.info(`got add repository result of ${JSON.stringify(indexResult.body)}`);
    const dbRepository: RepositoryDB = {
      ...baseRepository,
      _id: id
    };
    await new RepositoryModel(dbRepository).save();
    return `indexed repository with id ${id.toHexString()}`;
  }
}

export default AddRepositoryResolver;