/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query, Field, Ctx } from 'type-graphql';
import { elasticClient } from '../elastic/init';
import File, { SearchResult } from '../schema/file';
import { fileIndexName } from '../elastic/settings';
import { ObjectId } from 'mongodb';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/user';
import { RequestParams } from '@elastic/elasticsearch';
import { TermQuery } from '../elastic/types';
import { checkProjectAccess } from '../projects/auth';
import { AccessLevel } from '../schema/access';
import { checkRepositoryAccess } from '../repositories/auth';

@ArgsType()
class FilesArgs {
  @Field(_type => String, { description: 'query' })
  query: string;

  @Field(_type => ObjectId, { description: 'project', nullable: true })
  project?: ObjectId;

  @Field(_type => ObjectId, { description: 'repository', nullable: true })
  repository?: ObjectId;

  @Field(_type => ObjectId, { description: 'branch', nullable: true })
  branch?: ObjectId;
}

@Resolver()
class FilesResolver {
  @Query(_returns => [SearchResult])
  async files(@Args() args: FilesArgs, @Ctx() ctx: GraphQLContext): Promise<SearchResult[]> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const user = await UserModel.findById(ctx.auth.id);
    if (!user) {
      throw new Error('cannot find user');
    }
    // for potentially higher search performance:
    // ****************** https://stackoverflow.com/a/53653179/8623391 ***************
    const shouldParams: TermQuery[] = [];
    const mustParams: TermQuery[] = [];
    if (args.repository) {
      if (!args.project) {
        throw new Error('project id is required');
      }
      if (!checkRepositoryAccess(user, args.project, args.repository, AccessLevel.view)) {
        throw new Error('user does not have access to repository');
      }
      if (args.branch) {
        mustParams.push({
          term: {
            branchID: args.branch
          }
        });
      } else {
        mustParams.push({
          term: {
            repositoryID: args.repository
          }
        });
      }
    } else if (args.project) {
      if (!checkProjectAccess(user, args.project, AccessLevel.view)) {
        throw new Error('user does not have access to project');
      }
      mustParams.push({
        term: {
          projectID: args.project
        }
      });
    } else {
      if (user.repositories.length === 0 && user.projects.length === 0) {
        return [];
      }
      for (const projectID of user.projects) {
        shouldParams.push({
          term: {
            projectID: projectID._id.toHexString()
          }
        });
      }
      for (const repositoryID of user.repositories) {
        shouldParams.push({
          term: {
            repositoryID: repositoryID._id.toHexString()
          }
        });
      }
    }
    const searchParams: RequestParams.Search = {
      index: fileIndexName,
      body: {
        query: {
          bool: {
            must: {
              multi_match: {
                query: args.query,
                fuzziness: 'AUTO'
              }
            },
            filter: {
              bool: {
                should: shouldParams
              }
            }
          }
        }, // https://discuss.elastic.co/t/providing-weight-to-individual-fields/63081/3
        //https://stackoverflow.com/questions/39150946/highlight-in-elasticsearch
        highlight: {
          fields: {
            '*': {}
          },
          pre_tags: [''],
          post_tags: ['']
        }
      }
    };
    const elasticFileData = await elasticClient.search(searchParams);
    const results: SearchResult[] = [];
    for (const hit of elasticFileData.body.hits.hits) {
      const highlights = hit.highlight as { [key: string]: string };
      for (const path in highlights) {
        const pathSplit = path.split('.');
        const lastKey = pathSplit.pop();
        let currentElement = hit._source;
        let inClass = false;
        let inFunction = false;
        for (const key of pathSplit) {
          currentElement = currentElement[key];
        }
        // classes.functions.arguments.name
        /**
         * "highlight": {
            "classes.functions.arguments.name": [
              "asdf"
            ]
          }
         */
        switch (fieldKey) {
          case 'variables':
            // you got a variable
            results.push({
              _id: new ObjectId(hit._id as string),
              description: '',  
              details: '',
              location: null,
              name: ''
            })
        }
      }
    }
    return results;
  }
}

export default FilesResolver;