import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { FolderModel, FolderDB, BaseFolder, Folder } from '../schema/structure/folder';
import { baseFolderPath, baseFolderName, getParentFolderPaths } from '../shared/folders';
import { getFolder } from './folder.resolver';
import { UserModel } from '../schema/users/user';
import { checkRepositoryAccess } from '../repositories/auth';
import { AccessLevel } from '../schema/users/access';
import { elasticClient } from '../elastic/init';
import { folderIndexName } from '../elastic/settings';
import { getRepositoryByOwner } from '../repositories/repositoryNameExists.resolver';
import { RepositoryDB, RepositoryModel } from '../schema/structure/repository';

@ArgsType()
class AddFolderArgs {
  @Field({ description: 'folder name' })
  name: string;

  @Field({ description: 'folder path' })
  path: string;

  @Field(_type => String, { description: 'branch name' })
  branch: string;

  @Field(_type => ObjectId, { description: 'repository id', nullable: true })
  repositoryID?: ObjectId;

  @Field({ description: 'repository name', nullable: true })
  repository?: string;

  @Field({ description: 'owner name', nullable: true })
  owner?: string;
}

interface CreateFolderArgsType {
  name: string;
  path: string;
  repository: ObjectId;
  public: AccessLevel;
  branches: string[];
  parent: ObjectId;
}

export const createFolder = async (args: CreateFolderArgsType): Promise<FolderDB> => {
  const currentTime = new Date().getTime();
  const id = new ObjectId();
  const baseFolder: BaseFolder = {
    ...args,
    created: currentTime,
    updated: currentTime
  };
  const elasticFolder: Folder = {
    ...baseFolder,
    numBranches: 0
  };
  const dbFolder: FolderDB = {
    ...baseFolder,
    _id: id
  };
  await new FolderModel(dbFolder).save();
  await elasticClient.index({
    id: id.toHexString(),
    index: folderIndexName,
    body: elasticFolder
  });
  return dbFolder;
};

export const addFolderRecursiveUtil = async (repository: RepositoryDB, path: string, name: string, branch: string): Promise<ObjectId[]> => {
  if (!repository.branches.includes(branch)) {
    throw new Error(`branch ${branch} does not exist on repository ${repository.name}`);
  }
  const parentFolders = getParentFolderPaths(path + name);
  parentFolders.push({
    name,
    path
  });
  let lastFolderData = await getFolder({
    repositoryID: repository._id,
    name: baseFolderName,
    path: baseFolderPath
  });
  let addingFolders = false;
  const addedFolders: ObjectId[] = [];
  for (const folderPathData of parentFolders) {
    let currentFolderData: FolderDB;
    if (!addingFolders) {
      try {
        currentFolderData = await getFolder({
          repositoryID: repository._id,
          ...folderPathData
        });
        if (!currentFolderData.branches.includes(branch)) {
          // add branch to folder
          const currentTime = new Date().getTime();
          await FolderModel.updateOne({
            _id: currentFolderData._id
          }, {
            $addToSet: {
              branches: branch
            },
            $set: {
              updated: currentTime
            }
          });
          await elasticClient.update({
            index: folderIndexName,
            id: currentFolderData._id.toHexString(),
            body: {
              script: {
                source: `
                  ctx._source.numBranches++;
                  ctx._source.branches.add(params.branch);
                  ctx._source.updated = params.currentTime;
                `,
                lang: 'painless',
                params: {
                  branch,
                  currentTime
                }
              },
            }
          });
          currentFolderData.branches.push(branch);
        }
        lastFolderData = currentFolderData;
        continue;
      } catch (err) {
        // folder does not exist
        addingFolders = true;
      }
    }
    currentFolderData = await createFolder({
      ...folderPathData,
      public: repository.public,
      parent: lastFolderData._id,
      repository: repository._id,
      branches: [branch]
    });
    addedFolders.push(currentFolderData._id);
    lastFolderData = currentFolderData;
  }
  return addedFolders;
};

@Resolver()
class AddFolderResolver {
  @Mutation(_returns => String)
  async addFolder(@Args() args: AddFolderArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const userID = new ObjectId(ctx.auth.id);
    const user = await UserModel.findById(userID);
    if (!user) {
      throw new Error('cannot find user data');
    }
    let repository: RepositoryDB;
    if (args.repositoryID) {
      const repositoryData = await RepositoryModel.findById(args.repositoryID);
      if (!repositoryData) {
        throw new Error('cannot find repository with given id');
      }
      repository = repositoryData;
    } else if (args.repository && args.owner) {
      repository = await getRepositoryByOwner(args.repository, args.owner);
    } else {
      throw new Error('cannot get repository with insufficient input data');
    }
    if (!(await checkRepositoryAccess(user, repository, AccessLevel.view))) {
      throw new Error('user not authorized to view folder');
    }
    const addedFolders = await addFolderRecursiveUtil(repository, args.path, args.name, args.branch);
    return `added folders with ids: ${addedFolders.map(id => id.toHexString()).join(', ')}`;
  }
}

export default AddFolderResolver;
