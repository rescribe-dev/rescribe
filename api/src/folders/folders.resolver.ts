import { Resolver, ArgsType, Args, Query, Field, Ctx, Int } from 'type-graphql';
import { GraphQLContext } from '../utils/context';
import { Min, Max, MinLength, ArrayMaxSize, ArrayUnique } from 'class-validator';
import { queryMinLength } from '../shared/variables';
import { Folder } from '../schema/structure/folder';
import { checkPaginationArgs, setPaginationArgs } from '../elastic/pagination';
import { TermQuery } from '../elastic/types';
import User, { UserModel } from '../schema/users/user';
import { ObjectId } from 'mongodb';
import { ProjectDB } from '../schema/structure/project';
import { getSaveDatastore, DatastoreType } from '../files/files.resolver';
import { AccessLevel } from '../schema/users/access';
import { checkProjectAccess } from '../projects/auth';
import { checkAccessLevel } from '../auth/checkAccess';
import { checkRepositoryAccess } from '../repositories/auth';
import { RequestParams, ApiResponse } from '@elastic/elasticsearch';
import { folderIndexName } from '../elastic/settings';
import { getLogger } from 'log4js';
import { RepositoryDB } from '../schema/structure/repository';
import { elasticClient } from '../elastic/init';
import { verifyLoggedIn } from '../auth/checkAuth';

const logger = getLogger();

const maxPerPage = 20;
const projectsMaxLength = 5;
const repositoriesMaxLength = 5;
const branchesMaxLength = 5;

@ArgsType()
export class FoldersArgs {
  @MinLength(queryMinLength, {
    message: `query must be at least ${queryMinLength} characters long`
  })
  @Field(_type => String, { description: 'query', nullable: true })
  query?: string;

  @Field({ description: 'only user folders', nullable: true })
  onlyUser?: boolean;

  @Field({ description: 'folder path', nullable: true })
  path?: string;

  @Field({ description: 'folder name', nullable: true })
  name?: string;

  @ArrayMaxSize(projectsMaxLength, {
    message: `can only select up to ${projectsMaxLength} projects to filter from`
  })
  @ArrayUnique({
    message: 'all projects must be unique'
  })
  @Field(_type => [ObjectId], { description: 'projects', nullable: true })
  projects?: ObjectId[];

  @ArrayMaxSize(repositoriesMaxLength, {
    message: `can only select up to ${repositoriesMaxLength} repositories to filter from`
  })
  @ArrayUnique({
    message: 'all repositories must be unique'
  })
  @Field(_type => [ObjectId], { description: 'repositories', nullable: true })
  repositories?: ObjectId[];

  @ArrayMaxSize(branchesMaxLength, {
    message: `can only select up to ${branchesMaxLength} branches to filter from`
  })
  @ArrayUnique({
    message: 'all branches must be unique'
  })
  @Field(_type => [String], { description: 'branches', nullable: true })
  branches?: string[];

  @Min(0, {
    message: 'page number must be greater than or equal to 0'
  })
  @Field(_type => Int, { description: 'page number', nullable: true })
  page?: number;

  @Min(1, {
    message: 'per page must be greater than or equal to 1'
  })
  @Max(maxPerPage, {
    message: `per page must be less than or equal to ${maxPerPage}`
  })
  @Field(_type => Int, { description: 'number per page', nullable: true })
  perpage?: number;
}

export const mainFields: string[] = ['name'];

export const search = async (user: User | null, args: FoldersArgs, repositoryData?: { [key: string]: RepositoryDB }): Promise<ApiResponse<any, any> | null> => {
  if (args.onlyUser && !user) {
    throw new Error('cannot get only user folders when not logged in');
  }
  const filterShouldParams: TermQuery[] = [];
  const filterMustParams: TermQuery[] = [];
  const mustShouldParams: Record<string, unknown>[] = [];
  checkPaginationArgs(args);
  let hasStructureFilter = false;
  const projectData: { [key: string]: ProjectDB } = {};
  if (!repositoryData) {
    repositoryData = {};
  }
  if (args.name && (!args.path || !args.branches || args.branches?.length !== 1
    || !args.repositories || args.repositories.length !== 1)) {
    throw new Error('name, path, branch, and repository needs to be defined and singular to get file by name');
  }

  const repositoryFilters: TermQuery[] = [];

  if (args.projects && args.projects.length > 0) {
    if (!user) {
      throw new Error('user must be logged in to filter on projects');
    }
    hasStructureFilter = true;
    for (const projectID of args.projects) {
      await getSaveDatastore(projectID, projectData, DatastoreType.project);
      const project = projectData[projectID.toHexString()];
      if (!(await checkProjectAccess(user, project, AccessLevel.view))) {
        throw new Error('user does not have access to project');
      }
      for (const repositoryID of project.repositories) {
        repositoryFilters.push({
          term: {
            repository: repositoryID
          }
        });
      }
    }
  }

  if (args.repositories && args.repositories.length > 0) {
    hasStructureFilter = true;
    for (const repositoryID of args.repositories) {
      await getSaveDatastore(repositoryID, repositoryData, DatastoreType.repository);
      const repository = repositoryData[repositoryID.toHexString()];
      if (checkAccessLevel(repository.public, AccessLevel.view)) {
        // public access
      } else if (!user) {
        throw new Error(`user must be logged in to access repository ${repositoryID.toHexString()}`);
      } else {
        if (!(await checkRepositoryAccess(user, repository, AccessLevel.view))) {
          throw new Error('user does not have access to repository');
        }
      }
      repositoryFilters.push({
        term: {
          repository: repositoryID.toHexString()
        }
      });
    }
  }

  if (args.path) {
    filterMustParams.push({
      term: {
        path: args.path
      }
    });
  }

  if (args.branches && args.branches.length > 0) {
    hasStructureFilter = true;
    for (const branch of args.branches) {
      filterShouldParams.push({
        term: {
          branches: branch
        }
      });
    }
  }

  if (!hasStructureFilter) {
    if (args.onlyUser === undefined || !args.onlyUser) {
      // include public files too
      filterShouldParams.push({
        term: {
          public: AccessLevel.view
        }
      });
    }
    if (user) {
      if (user.repositories.length === 0) {
        return null;
      }
      for (const repository of user.repositories) {
        filterShouldParams.push({
          term: {
            repository: repository._id.toHexString()
          }
        });
      }
      filterShouldParams.push({
        term: {
          public: AccessLevel.view
        }
      });
      filterShouldParams.push({
        term: {
          public: AccessLevel.edit
        }
      });
    }
  }
  if (args.query) {
    const fieldsQuery: Record<string, unknown> = {
      multi_match: {
        query: args.query,
        fields: mainFields
      }
    };
    mustShouldParams.push(fieldsQuery);
  }
  const searchParams: RequestParams.Search = {
    index: folderIndexName,
    body: {
      query: {
        bool: {
          must: [ // must adds to score
            { // holds the query itself
              bool: {
                should: mustShouldParams
              }
            }
          ],
          filter: [ // filter is ignored from score
            { // can match to any of should - holds permissions right now
              bool: {
                should: filterShouldParams
              }
            }, // needs to match all in must
            { // holds single file and / or path
              bool: {
                must: filterMustParams
              }
            }, // single category match for individuals
            { // holds repository filters
              bool: {
                should: repositoryFilters
              }
            }
          ]
        }
      }, // https://discuss.elastic.co/t/providing-weight-to-individual-fields/63081/3
      //https://stackoverflow.com/questions/39150946/highlight-in-elasticsearch
      sort: {
        _score: {
          order: 'desc'
        }
      }
    }
  };
  setPaginationArgs(args, searchParams);
  logger.info(JSON.stringify(searchParams, null, 2));
  const startTime = new Date();
  const elasticFileData = await elasticClient.search(searchParams);
  logger.info(`search folders function time: ${new Date().getTime() - startTime.getTime()}`);
  return elasticFileData;
};

@Resolver()
class FoldersResolver {
  @Query(_returns => [Folder])
  async folders(@Args() args: FoldersArgs, @Ctx() ctx: GraphQLContext): Promise<Folder[]> {
    let user: User | null;
    if (verifyLoggedIn(ctx) && ctx.auth) {
      user = await UserModel.findById(ctx.auth.id);
      if (!user) {
        throw new Error('cannot find user');
      }
    } else {
      user = null;
    }
    const elasticFolderData = await search(user, args);
    const result: Folder[] = [];
    if (!elasticFolderData) {
      return result;
    }
    for (const hit of elasticFolderData.body.hits.hits) {
      const currentFolder: Folder = {
        ...hit._source as Folder,
        _id: new ObjectId(hit._id as string)
      };
      result.push(currentFolder);
    }
    return result;
  }
}

export default FoldersResolver;
