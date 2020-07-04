import { Resolver, ArgsType, Args, Query, Field, Ctx } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { Repository, RepositoryDB } from '../schema/structure/repository';
import { repositoryIndexName } from '../elastic/settings';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import User, { UserModel } from '../schema/auth/user';
import { elasticClient } from '../elastic/init';
import { checkRepositoryAccess, checkRepositoryPublic } from './auth';
import { AccessLevel } from '../schema/auth/access';
import { TermQuery } from '../elastic/types';
import { getUser } from '../users/shared';

@ArgsType()
class RepositoryArgs {
  @Field(_type => ObjectId, { description: 'repository id', nullable: true })
  id?: ObjectId;

  @Field({ description: 'repository name', nullable: true })
  name?: string;

  @Field({ description: 'repository owner', nullable: true })
  owner?: string;
}

@Resolver()
class RepositoryResolver {
  @Query(_returns => Repository)
  async repository(@Args() args: RepositoryArgs, @Ctx() ctx: GraphQLContext): Promise<Repository> {
    let repository: Repository;
    let user: User | null = null;
    if (args.owner && !args.name) {
      throw new Error('cannot query repository by owner without name');
    }
    if (verifyLoggedIn(ctx) && ctx.auth) {
      const userID = new ObjectId(ctx.auth.id);
      user = await UserModel.findById(userID);
      if (!user) {
        throw new Error('cannot find user data');
      }
    }
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
      if (user) {
        for (const repository of user.repositories) {
          shouldParams.push({
            term: {
              _id: repository._id.toHexString()
            }
          });
        }
      }
      shouldParams.push({
        term: {
          public: AccessLevel.view
        }
      });
      shouldParams.push({
        term: {
          public: AccessLevel.edit
        }
      });
      const mustParams: TermQuery[] = [{
        term: {
          name: args.name.toLowerCase()
        }
      }];
      if (args.owner) {
        const ownerData = await getUser(args.owner);
        mustParams.push({
          term: {
            owner: ownerData._id
          }
        });
      }
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
    if (user && !(await checkRepositoryAccess(user, repositoryDBType, AccessLevel.view))) {
      throw new Error('user not authorized to view repository');
    } else if (!await checkRepositoryPublic(repositoryDBType, AccessLevel.view)) {
      throw new Error('repository is not public');
    }
    return repository;
  }
}

export default RepositoryResolver;
