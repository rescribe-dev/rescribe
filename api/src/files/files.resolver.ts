/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query } from 'type-graphql';
import { elasticClient } from '../elastic/init';
import File from '../schema/file';
import { fileIndexName } from '../elastic/settings';

@ArgsType()
class FilesArgs {}

@Resolver()
class FilesResolver {
  @Query(_returns => [File])
  async files(@Args() _args: FilesArgs): Promise<File[]> {
    const elasticFileData = await elasticClient.search({
      index: fileIndexName,
      body: {
        query: {
          match_all: {}
        }
      }
    });
    const result: File[] = [];
    for (const hit of elasticFileData.body.hits.hits) {
      const currentFile: File = {
        _id: hit._id,
        ...hit._source
      };
      result.push(currentFile);
    }
    return result;
  }
}

export default FilesResolver;
