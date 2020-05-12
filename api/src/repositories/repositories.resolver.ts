/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query } from 'type-graphql';
import { elasticClient } from '../elastic/init';
import { repositoryIndexName } from '../elastic/settings';
import { ObjectId } from 'mongodb';
import { Repository } from '../schema/repository';

@ArgsType()
class RepositoriesArgs {}

@Resolver()
class RepositoriesResolver {
  @Query(_returns => [Repository])
  async repositories(@Args() _args: RepositoriesArgs): Promise<Repository[]> {
    const elasticRepositoryData = await elasticClient.search({
      index: repositoryIndexName,
      body: {
        query: {
          match_all: {}
        }
      }
    });
    const result: Repository[] = [];
    for (const hit of elasticRepositoryData.body.hits.hits) {
      const currentRepository: Repository = {
        _id: new ObjectId(hit._id),
        ...hit._source
      };
      result.push(currentRepository);
    }
    return result;
  }
}

export default RepositoriesResolver;
