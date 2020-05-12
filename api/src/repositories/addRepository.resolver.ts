import { Resolver, ArgsType, Field, Args, Mutation } from 'type-graphql';
import { repositoryIndexName } from '../elastic/settings';
import { elasticClient } from '../elastic/init';
import { ObjectId } from 'mongodb';
import { Repository, BaseRepository, RepositoryDB, RepositoryModel } from '../schema/repository';
import { ProjectModel } from '../schema/project';

@ArgsType()
class AddRepositoryArgs {
  @Field(_type => String, { description: 'repository name' })
  name: string;
  @Field(_type => ObjectId, { description: 'repository name' })
  project: ObjectId;
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
      project: args.project
    };
    const elasticRepository: Repository = {
      created: currentTime,
      updated: currentTime,
      ...baseRepository
    };
    await elasticClient.index({
      id: id.toHexString(),
      index: repositoryIndexName,
      body: elasticRepository
    });
    await ProjectModel.updateOne({
      _id: args.project
    }, {
      $addToSet: {
        repositories: id
      }
    });    
    const dbRepository: RepositoryDB = {
      ...baseRepository,
      _id: id
    };
    await new RepositoryModel(dbRepository).save();
    return `indexed repository with id ${id.toHexString()}`;
  }
}

export default AddRepositoryResolver;