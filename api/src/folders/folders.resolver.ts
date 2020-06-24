/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query, Field, Ctx, Int } from 'type-graphql';
import { elasticClient } from '../elastic/init';
import File, { FileModel, FileDB } from '../schema/structure/file';
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
import { Min, Max, MinLength, ArrayMaxSize, ArrayUnique } from 'class-validator';
import { RepositoryDB, RepositoryModel } from '../schema/structure/repository';
import { checkPaginationArgs, setPaginationArgs } from '../utils/pagination';
import { ProjectDB, ProjectModel } from '../schema/structure/project';
import { getLogger } from 'log4js';
import { checkAccessLevel } from '../utils/checkAccess';
import { queryMinLength } from '../utils/variables';

const logger = getLogger();

const maxPerPage = 20;
const projectsMaxLength = 5;
const repositoriesMaxLength = 5;
const branchesMaxLength = 5;

@ArgsType()
export class FilesArgs {
  @MinLength(queryMinLength, {
    message: `query must be at least ${queryMinLength} characters long`
  })
  @Field(_type => String, { description: 'query', nullable: true })
  query?: string;

  @Field({ description: 'only user files', nullable: true })
  onlyUser?: boolean;

  @Field({ description: 'file path', nullable: true })
  path?: string;

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

  @Field(_type => ObjectId, { description: 'file id', nullable: true })
  file?: ObjectId;

  @Field({ description: 'file name', nullable: true })
  name?: string;

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

export const nestedFields = [
  'classes',
  'functions',
  'variables',
  'imports',
  'comments'
];

export const mainFields = [
  'name',
  'importPath',
  'path'
];

enum DatastoreType {
  project,
  repository
};

const getSaveDatastore = async (id: ObjectId, datastore: { [key: string]: ProjectDB | RepositoryDB }, type: DatastoreType): Promise<void> => {
  if (!(id.toHexString() in datastore)) {
    if (type === DatastoreType.project) {
      const project = await ProjectModel.findById(id);
      if (!project) {
        throw new Error(`cannot find project with id ${id.toHexString()}`);
      }
      datastore[id.toHexString()] = project;
    } else if (type === DatastoreType.repository) {
      const repository = await RepositoryModel.findById(id);
      if (!repository) {
        throw new Error(`cannot find repository with id ${id.toHexString()}`);
      }
      datastore[id.toHexString()] = repository;
    } else {
      throw new Error('invalid datastore type');
    }
  }
};

export const search = async (user: User | null, args: FilesArgs, repositoryData?: { [key: string]: RepositoryDB }): Promise<ApiResponse<any, any> | null> => {
  // for potentially higher search performance:
  // ****************** https://stackoverflow.com/a/53653179/8623391 ***************
  if (args.onlyUser && !user) {
    throw new Error('cannot get only user files when not logged in');
  }
  const filterShouldParams: TermQuery[] = [];
  const filterMustParams: TermQuery[] = [];
  const mustShouldParams: object[] = [];
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
  const oneFile = args.file !== undefined || args.name;
  if (oneFile) {
    let file: FileDB | null;
    if (args.name && args.branches && args.repositories) {
      file = await FileModel.findOne({
        name: args.name,
        path: args.path,
        branches: args.branches[0],
        repository: args.repositories[0]
      });
    } else {
      file = await FileModel.findById(args.file);
    }
    if (!file) {
      throw new Error('cannot find file with given id');
    }
    if (checkAccessLevel(file.public, AccessLevel.view)) {
      // public access
    } else if (!user) {
      throw new Error(`user must be logged in to access file ${args.name ? args.name : args.file?.toHexString()}`);
    } else {
      await getSaveDatastore(file.repository, repositoryData, DatastoreType.repository);
      const repository = repositoryData[file.repository.toHexString()];
      await getSaveDatastore(repository.project, projectData, DatastoreType.project);
      // const project = projectData[repository.project.toHexString()];
      if (!(await checkRepositoryAccess(user, repository, AccessLevel.view))) {
        throw new Error('user does not have access to repository');
      }
    }
    if (args.name && args.branches && args.repositories) {
      filterMustParams.concat([{
        term: {
          name: args.name
        }
      },
      {
        term: {
          path: args.path
        }
      },
      {
        term: {
          branch: args.branches[0]
        }
      },
      {
        term: {
          repository: args.repositories[0]
        }
      }
      ]);
    } else {
      filterMustParams.push({
        term: {
          _id: args.file?.toHexString()
        }
      });
    }
  }
  if (args.projects && args.projects.length > 0) {
    if (oneFile) {
      throw new Error('file cannot be defined with projects');
    }
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
      filterShouldParams.push({
        term: {
          project: projectID.toHexString()
        }
      });
    }
  }
  if (args.repositories && args.repositories.length > 0) {
    if (oneFile) {
      throw new Error('file cannot be defined with repositories');
    }
    hasStructureFilter = true;
    for (const repositoryID of args.repositories) {
      await getSaveDatastore(repositoryID, repositoryData, DatastoreType.repository);
      const repository = repositoryData[repositoryID.toHexString()];
      if (checkAccessLevel(repository.public, AccessLevel.view)) {
        // public access
      } else if (!user) {
        throw new Error(`user must be logged in to access file ${args.file?.toHexString()}`);
      } else {
        await getSaveDatastore(repository.project, projectData, DatastoreType.project);
        // const project = projectData[repository.project.toHexString()];
        if (!(await checkRepositoryAccess(user, repository, AccessLevel.view))) {
          throw new Error('user does not have access to repository');
        }
      }
      filterShouldParams.push({
        term: {
          repository: repositoryID.toHexString()
        }
      });
    }
  }

  if (args.path) {
    if (oneFile) {
      throw new Error('path cannot be defined with single file search');
    }
    filterMustParams.push({
      term: {
        path: args.path
      }
    });
  }

  if (args.branches && args.branches.length > 0) {
    if (oneFile) {
      throw new Error('banches cannot be defined with single file search');
    }
    hasStructureFilter = true;
    for (const branch of args.branches) {
      filterShouldParams.push({
        term: {
          branches: branch
        }
      });
    }
  }

  if (!oneFile && !hasStructureFilter) {
    if (args.onlyUser === undefined || !args.onlyUser) {
      // include public files too
      filterShouldParams.push({
        term: {
          public: AccessLevel.view
        }
      });
    }
    if (user) {
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
  const highlight: object = {
    fields: {
      '*': {}
    },
    pre_tags: [''],
    post_tags: ['']
  };
  for (const nestedField of nestedFields) {
    const currentQuery: object = args.query ? {
      multi_match: {
        query: args.query
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
            },
          },
          filter: {
            bool: {
              should: filterShouldParams,
              must: filterMustParams
            },
          }
        }
      }, // https://discuss.elastic.co/t/providing-weight-to-individual-fields/63081/3
      //https://stackoverflow.com/questions/39150946/highlight-in-elasticsearch
      highlight,
      sort: {
        _score: {
          order: 'desc'
        }
      }
    }
  };
  if (!oneFile) {
    setPaginationArgs(args, searchParams);
  }
  const startTime = new Date();
  const elasticFileData = await elasticClient.search(searchParams);
  logger.info(`search function time: ${new Date().getTime() - startTime.getTime()}`);
  return elasticFileData;
};

@Resolver()
class FoldersResolver {
  @Query(_returns => [File])
  async folders(@Args() args: FilesArgs, @Ctx() ctx: GraphQLContext): Promise<File[]> {
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

export default FoldersResolver;
