/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query } from 'type-graphql';
import { File } from '../schema/structure';
import { elasticClient } from '../elastic/init';
import { getLogger } from 'log4js';

const logger = getLogger();

@ArgsType()
class FilesArgs {}

@Resolver()
class FilesResolver {
  @Query(_returns => File)
  async files(@Args() _args: FilesArgs): Promise<File[]> {
    const elasticFileData = await elasticClient.search({
      body: {
        query: {
          match_all: {}
        }
      }
    });
    const sourceData = elasticFileData.body.hits.hits;
    logger.info(sourceData);
    return [];
  }
}

export default FilesResolver;
