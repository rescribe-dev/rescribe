import { Resolver, ArgsType, Field, Args, Ctx, Query } from 'type-graphql';
import File, { BaseFileElastic, BaseFile } from '../schema/structure/file';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { ObjectId } from 'mongodb';
import { UserModel } from '../schema/users/user';
import { checkRepositoryAccess, checkRepositoryPublic } from '../repositories/auth';
import { AccessLevel } from '../schema/users/access';
import { elasticClient } from '../elastic/init';
import { fileIndexName } from '../elastic/settings';
import { getRepositoryByOwner } from '../repositories/repositoryNameExists.resolver';
import { TermQuery } from '../elastic/types';

@ArgsType()
class FileArgs {
  @Field(_type => ObjectId, { description: 'file id', nullable: true })
  id?: ObjectId;

  @Field({ description: 'file name', nullable: true })
  name?: string;

  @Field({ description: 'file path', nullable: true })
  path?: string;

  @Field({ description: 'file branch', nullable: true })
  branch?: string;

  @Field(_type => ObjectId, { description: 'repository id', nullable: true })
  repositoryID?: ObjectId;

  @Field({ description: 'repository name', nullable: true })
  repository?: string;

  @Field({ description: 'owner name', nullable: true })
  owner?: string;
}

const processFile = (id: ObjectId, baseFile: File | BaseFile): File => {
  let file: File;
  baseFile.repository = new ObjectId(baseFile.repository);
  if (baseFile.hasStructure) {
    file = {
      ...baseFile as File,
      _id: id
    };
  } else {
    file = {
      ...baseFile as BaseFileElastic,
      _id: id,
      classes: [],
      comments: [],
      variables: [],
      functions: [],
      importPath: '',
      imports: [],
    };
  }
  return file;
};

export const getFile = async (args: FileArgs): Promise<File> => {
  if (args.id) {
    const fileData = await elasticClient.get({
      id: args.id.toHexString(),
      index: fileIndexName
    });
    return processFile(args.id, fileData.body._source as BaseFileElastic);
  }
  if (args.name !== undefined && args.branch !== undefined && args.path !== undefined && (args.repositoryID || (args.repository && args.owner))) {
    if (!args.repositoryID) {
      if (!args.repository || !args.owner) {
        throw new Error('repo or owner is undefined');
      }
      const repository = await getRepositoryByOwner(args.repository, args.owner);
      args.repositoryID = repository._id;
    }
    const filters: TermQuery[] = [{
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
        branches: args.branch
      }
    },
    {
      term: {
        repository: args.repositoryID.toHexString()
      }
    }];
    const fileData = await elasticClient.search({
      index: fileIndexName,
      body: {
        query: {
          bool: {
            must: filters
          }
        }
      }
    });
    if (!fileData) {
      throw new Error('no data found');
    }
    for (const hit of fileData.body.hits.hits) {
      return processFile(new ObjectId(hit._id as string), hit._source as File);
    }
    throw new Error('no file data found');
  } else {
    throw new Error('invalid combination of parameters to get file data');
  }
};

export const getFileAuthenticated = async (args: FileArgs, ctx: GraphQLContext): Promise<File> => {
  const file = await getFile(args);
  const repositoryID = new ObjectId(file.repository);
  if (await checkRepositoryPublic(repositoryID, AccessLevel.view)) {
    return file;
  }
  if (!verifyLoggedIn(ctx) || !ctx.auth) {
    throw new Error('user not logged in');
  }
  const userID = new ObjectId(ctx.auth.id);
  const user = await UserModel.findById(userID);
  if (!user) {
    throw new Error('cannot find user data');
  }
  if (!(await checkRepositoryAccess(user, repositoryID, AccessLevel.view))) {
    throw new Error('user not authorized to view file');
  }
  return file;
};

@Resolver()
class FileResolver {
  @Query(_returns => File)
  async file(@Args() args: FileArgs, @Ctx() ctx: GraphQLContext): Promise<File> {
    return await getFileAuthenticated(args, ctx);
  }
}

export default FileResolver;
