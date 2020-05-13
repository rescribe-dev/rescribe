/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query, Field, Ctx } from 'type-graphql';
import { elasticClient } from '../elastic/init';
import File, { FileSearchResult } from '../schema/file';
import { fileIndexName } from '../elastic/settings';
import { ObjectId } from 'mongodb';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/user';

@ArgsType()
class FilesArgs {
  @Field(_type => String, { description: 'query' })
  query: string;
}

@Resolver()
class FilesResolver {
  @Query(_returns => [FileSearchResult])
  async files(@Args() args: FilesArgs, @Ctx() ctx: GraphQLContext): Promise<FileSearchResult[]> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const user = await UserModel.findById(ctx.auth.id);
    if (!user) {
      throw new Error('cannot find user');
    }
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
        ...hit._source as File,
        _id: new ObjectId(hit._id as string),
        fields: matchFields
      };
      result.push(currentFile);
    }
    return result;
  }
}

export default FilesResolver;