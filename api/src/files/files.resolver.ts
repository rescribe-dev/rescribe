/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query, Field, Ctx } from 'type-graphql';
import { elasticClient } from '../elastic/init';
import File from '../schema/structure/file';
import { fileIndexName } from '../elastic/settings';
import { ObjectId } from 'mongodb';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import User, { UserModel } from '../schema/auth/user';
import { RequestParams, ApiResponse } from '@elastic/elasticsearch';
import { TermQuery } from '../elastic/types';
import { checkProjectAccess } from '../projects/auth';
import { AccessLevel } from '../schema/auth/access';
import { checkRepositoryAccess } from '../repositories/auth';

@ArgsType()
export class FilesArgs {
  @Field(_type => String, { description: 'query', nullable: true })
  query?: string;

  @Field(_type => ObjectId, { description: 'project', nullable: true })
  project?: ObjectId;

  @Field(_type => ObjectId, { description: 'repository', nullable: true })
  repository?: ObjectId;

  @Field(_type => ObjectId, { description: 'branch', nullable: true })
  branch?: ObjectId;
}

const nestedFields = [
  'classes',
  'functions',
  'variables',
  'imports',
  'comments'
];

const mainFields = [
  'name',
  'importPath',
  'path',
  'location'
];

export const search = async (user: User, args: FilesArgs): Promise<ApiResponse<any, any> | null> => {
  // for potentially higher search performance:
  // ****************** https://stackoverflow.com/a/53653179/8623391 ***************
  const filterShouldParams: TermQuery[] = [];
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
          branch: args.branch
        }
      });
    } else {
      mustParams.push({
        term: {
          repository: args.repository
        }
      });
    }
  } else if (args.project) {
    if (!checkProjectAccess(user, args.project, AccessLevel.view)) {
      throw new Error('user does not have access to project');
    }
    mustParams.push({
      term: {
        project: args.project
      }
    });
  } else {
    if (user.repositories.length === 0 && user.projects.length === 0) {
      return null;
    }
    for (const project of user.projects) {
      filterShouldParams.push({
        term: {
          project: project._id.toHexString()
        }
      });
    }
    for (const repository of user.repositories) {
      filterShouldParams.push({
        term: {
          repository: repository._id.toHexString()
        }
      });
    }
  }
  const highlight: object = {
    fields: {
      '*': {}
    },
    pre_tags: [''],
    post_tags: ['']
  };
  const mustShouldParams: object[] = [];
  for (const nestedField of nestedFields) {
    const currentQuery: object = args.query ? {
      multi_match: {
        query: args.query,
        fuzziness: 'AUTO'
      }
    } : {
        match_all: {}
      };
    mustShouldParams.push({
      nested: {
        path: nestedField,
        query: currentQuery,
        inner_hits: {
          highlight
        }
      }
    });
  }
  const fieldsQuery: object = args.query ? {
    multi_match: {
      query: args.query,
      fuzziness: 'AUTO',
      fields: mainFields
    }
  } : {
    multi_match: {
      query: '*',
      fields: mainFields
    }
  };
  mustShouldParams.push(fieldsQuery);
  const searchParams: RequestParams.Search = {
    index: fileIndexName,
    body: {
      query: {
        bool: {
          must: {
            bool: {
              should: mustShouldParams
            }
          },
          filter: {
            bool: {
              should: filterShouldParams
            }
          }
        }
      }, // https://discuss.elastic.co/t/providing-weight-to-individual-fields/63081/3
      //https://stackoverflow.com/questions/39150946/highlight-in-elasticsearch
      highlight
    }
  };
  const elasticFileData = await elasticClient.search(searchParams);
  return elasticFileData;
};

@Resolver()
class FilesResolver {
  @Query(_returns => [File])
  async files(@Args() args: FilesArgs, @Ctx() ctx: GraphQLContext): Promise<File[]> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const user = await UserModel.findById(ctx.auth.id);
    if (!user) {
      throw new Error('cannot find user');
    }
    const elasticFileData = await search(user, args);
    const result: File[] = [];
    if (!elasticFileData) {
      return result;
    }
    for (const hit of elasticFileData.body.hits.hits) {
      const currentFile: File = {
        ...hit._source as File,
        _id: new ObjectId(hit._id as string),
      };
      result.push(currentFile);
    }
    return result;
  }
}

export default FilesResolver;
