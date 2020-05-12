/* eslint-disable @typescript-eslint/camelcase */
import { Resolver, ArgsType, Args, Query, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { RepositoryModel, RepositoryDB } from '../schema/repository';

@ArgsType()
class RepositoryArgs {
  @Field({ description: 'repository name' })
  repository: string;
  @Field(_type => ObjectId, { description: 'repository name' })
  project: ObjectId;
}

@Resolver()
class RepositoryResolver {
  @Query(_returns => RepositoryDB)
  async repository(@Args() args: RepositoryArgs): Promise<RepositoryDB> {
    const repositoryResult = await RepositoryModel.findOne({
      name: args.repository,
      project: args.project
    });
    if (!repositoryResult) {
      throw new Error('cannot find repository');
    }
    return repositoryResult;
  }
}

export default RepositoryResolver;