/* eslint-disable @typescript-eslint/camelcase */
import { Resolver, ArgsType, Args, Query, Field, Ctx } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { Repository, RepositoryDB } from '../schema/structure/repository';
import { repositoryIndexName } from '../elastic/settings';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/auth/user';
import { elasticClient } from '../elastic/init';
import { checkRepositoryAccess } from './auth';
import { AccessLevel } from '../schema/auth/access';
import { TermQuery } from '../elastic/types';

@ArgsType()
class RepositoryArgs {
  @Field(_type => ObjectId, { description: 'repository id', nullable: true })
  id?: ObjectId;

  @Field({ description: 'repository name', nullable: true })
  name?: string;
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
    let repository: Repository;
    if (args.id) {
      const repositoryData = await elasticClient.get({
        id: args.id.toHexString(),
        index: repositoryIndexName
      });
      repository = {
        ...repositoryData.body._source as Repository,
        _id: new ObjectId(repositoryData.body._id as string)
      };
    } else if (args.name) {
      const shouldParams: TermQuery[] = [];
      for (const repository of user.repositories) {
        shouldParams.push({
          term: {
            _id: repository._id.toHexString()
          }
        });
      }
      const mustParams: TermQuery[] = [{
        term: {
          name: args.name.toLowerCase()
        }
      }];
      const repositoryData = await elasticClient.search({
        index: repositoryIndexName,
        body: {
          query: {
            bool: {
              should: shouldParams,
              must: mustParams
            }
          }
        }
      });
      if (repositoryData.body.hits.hits.length === 0) {
        throw new Error('could not find repository');
      }
      repository = {
        ...repositoryData.body.hits.hits[0]._source as Repository,
        _id: new ObjectId(repositoryData.body.hits.hits[0]._id as string)
      };
    } else {
      throw new Error('user must supply name or id');
    }
    const repositoryDBType: RepositoryDB = {
      ...repository,
      image: '',
      _id: repository._id as ObjectId
    };
    if (!(await checkRepositoryAccess(user, repositoryDBType, AccessLevel.view))) {
      throw new Error('user not authorized to view repository');
    }
    return repository;
  }
}

export default RepositoryResolver;
