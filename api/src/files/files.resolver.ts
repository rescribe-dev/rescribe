/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query, Field } from 'type-graphql';
import { elasticClient } from '../elastic/init';
import { FileSearchResult } from '../schema/file';
import { fileIndexName } from '../elastic/settings';

@ArgsType()
class FilesArgs {
  @Field(_type => String, { description: 'query' })
  query: string;
}

@Resolver()
class FilesResolver {
  @Query(_returns => [FileSearchResult])
  async files(@Args() args: FilesArgs): Promise<FileSearchResult[]> {
    // for potentially higher search performance:
    // ****************** https://stackoverflow.com/a/53653179/8623391 ***************
    const elasticFileData = await elasticClient.search({
      index: fileIndexName,
      body: {
        query: {
          multi_match: {
            query: args.query,
            fuzziness: 'AUTO'
          }
        },
        //https://stackoverflow.com/questions/39150946/highlight-in-elasticsearch
        highlight: {
          fields: {
            '*': {}
          },
          pre_tags: [''],
          post_tags: ['']
        }
      }
    });
    const result: FileSearchResult[] = [];
    for (const hit of elasticFileData.body.hits.hits) {
      const matchFields: string[] = [];
      for (const fieldKey in hit.highlight) {
        matchFields.push(`${fieldKey}:${hit.highlight[fieldKey]}`);
      }
      const currentFile: FileSearchResult = {
        _id: hit._id,
        fields: matchFields,
        ...hit._source
      };
      result.push(currentFile);
    }
    return result;
  }
}

export default FilesResolver;
