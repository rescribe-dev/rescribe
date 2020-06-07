/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query, Field, Ctx } from 'type-graphql';
import { Repository, RepositoryDB } from '../schema/structure/repository';
import { ObjectId } from 'mongodb';
import { repositoryIndexName } from '../elastic/settings';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/auth/user';
import { elasticClient } from '../elastic/init';
import { checkRepositoryAccess } from '../repositories/auth';
import { AccessLevel } from '../schema/auth/access';

@ArgsType()
class BranchesArgs {
  @Field(_type => ObjectId, { description: 'repository id' })
  repository: ObjectId;
}

@Resolver()
class BranchesResolver {
  @Query(_returns => [String])
  async branches(@Args() args: BranchesArgs, @Ctx() ctx: GraphQLContext): Promise<string[]> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const userID = new ObjectId(ctx.auth.id);
    const user = await UserModel.findById(userID);
    if (!user) {
      throw new Error('cannot find user data');
    }
    const repositoryData = await elasticClient.get({
      id: args.repository.toHexString(),
      index: repositoryIndexName
    });
    const repository: Repository = {
      ...repositoryData.body._source as Repository,
      _id: new ObjectId(repositoryData.body._id as string)
    };
    const repositoryDBType: RepositoryDB = {
      ...repository,
      image: '', // can leave empty as not necessary to check user access
      _id: repository._id as ObjectId
    };
    if (!(await checkRepositoryAccess(user, repository.project, repositoryDBType, AccessLevel.view))) {
      throw new Error('user not authorized to view project');
    }
    return repository.branches;
  }
}

export default BranchesResolver;
