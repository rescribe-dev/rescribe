/* eslint-disable @typescript-eslint/camelcase */
import { Resolver, ArgsType, Args, Query, Field, Ctx } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { Repository } from '../schema/repository';
import { repositoryIndexName } from '../elastic/settings';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/user';
import { elasticClient } from '../elastic/init';
import { checkRepositoryAccess } from './auth';
import { AccessLevel } from '../schema/access';

@ArgsType()
class RepositoryArgs {
  @Field(_type => ObjectId, { description: 'repository id' })
  id: ObjectId;
}

@Resolver()
class RepositoryResolver {
  @Query(_returns => Repository)
  async repository(@Args() args: RepositoryArgs, @Ctx() ctx: GraphQLContext): Promise<Repository> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const userID = new ObjectId(ctx.auth.id);
    const user = await UserModel.findById(userID);
    if (!user) {
      throw new Error('cannot find user data');
    }
    const repositoryData = await elasticClient.get({
      id: args.id.toHexString(),
      index: repositoryIndexName
    });
    const repository: Repository = {
      ...repositoryData.body._source as Repository,
      _id: new ObjectId(repositoryData.body._id as string)
    };
    if (!checkRepositoryAccess(user, repository.project, args.id, AccessLevel.view)) {
      throw new Error('user not authorized to view repository');
    }
    return repository;
  }
}

export default RepositoryResolver;
