import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { fileIndexName, folderIndexName } from '../elastic/settings';
import { ObjectId } from 'mongodb';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/auth/user';
import { checkRepositoryAccess } from '../repositories/auth';
import { AccessLevel } from '../schema/auth/access';
import { s3Client, fileBucket, getFileKey } from '../utils/aws';
import { SaveElasticElement, bulkSaveToElastic } from '../utils/elastic';
import { UpdateType } from './shared';
import { WriteMongoElement, bulkSaveToMongo } from '../utils/mongo';
import { FileModel, FileDB } from '../schema/structure/file';
import { FolderModel } from '../schema/structure/folder';
import { baseFolderName, baseFolderPath } from '../folders/shared';

@ArgsType()
class DeleteFilesArgs {
  @Field(_type => [ObjectId], { description: 'file ids' })
  files: ObjectId[];

  @Field(_type => ObjectId, { description: 'repository id' })
  repository: ObjectId;

  @Field(_type => String, { description: 'branch name' })
  branch: string;
}

export const deleteFilesUtil = async (repository: ObjectId, branch: string, files?: ObjectId[] | string[] | FileDB[]): Promise<void> => {
  // does not delete base folder
  const bulkUpdateFileElasticData: SaveElasticElement[] = [];
  const bulkUpdateFileMongoData: WriteMongoElement[] = [];
  const currentTime = new Date().getTime();
  let fileFilter: object = {
    repository,
    branches: branch
  };
  let allFileData: FileDB[] | undefined = undefined;
  if (files) {
    if (files.length === 0) return;
    if (files[0] instanceof ObjectId) {
      // file id
      fileFilter = {
        ...fileFilter,
        _id: {
          $in: files
        }
      };
    } else if (files[0] instanceof String) {
      // path
      fileFilter = {
        ...fileFilter,
        path: {
          $in: files
        }
      };
    } else {
      // FileDB
      allFileData = files as FileDB[];
    }
  }
  if (!allFileData) {
    allFileData = await FileModel.find(fileFilter);
  }
  for (const fileData of allFileData) {
    if (fileData.branches.length === 1) {
      bulkUpdateFileElasticData.push({
        action: UpdateType.delete,
        id: fileData._id,
        index: fileIndexName
      });
      bulkUpdateFileMongoData.push({
        action: UpdateType.delete,
        filter: {
          _id: fileData._id,
          repository
        }
      });
      await s3Client.deleteObject({
        Bucket: fileBucket,
        Key: getFileKey(repository, fileData._id)
      }).promise();
    } else {
      bulkUpdateFileElasticData.push({
        action: UpdateType.update,
        data: {
          script: {
            source: `
              ctx._source.numBranches--;
              ctx._source.branches.remove(params.branch);
              ctx._source.updated = params.currentTime;
            `,
            lang: 'painless',
            params: {
              branch,
              repository: repository.toHexString(),
              currentTime
            }
          }
        },
        id: fileData._id,
        index: fileIndexName
      });
      bulkUpdateFileMongoData.push({
        action: UpdateType.delete,
        filter: {
          _id: fileData._id,
          branch,
          repository
        }
      });
    }
  }

  const parentFolderIDsSet = new Set<ObjectId>();
  for (const fileData of allFileData) {
    if (fileData.name === baseFolderName && fileData.path === baseFolderPath) {
      continue;
    }
    if (fileData.folder) {
      parentFolderIDsSet.add(fileData.folder);
    }
  }
  const bulkUpdateFolderElasticData: SaveElasticElement[] = [];
  const bulkUpdateFolderMongoData: WriteMongoElement[] = [];
  for (const parentFolderID of parentFolderIDsSet.values()) {
    const numChildren = await FileModel.count({
      folder: parentFolderID,
      repository,
      branches: {
        $all: [branch]
      }
    });
    if (numChildren === 1) {
      // remove branch from folder
      const folderData = await FolderModel.findById(parentFolderID);
      if (!folderData) {
        throw new Error(`cannot find folder with id ${parentFolderID.toHexString()}`);
      }
      if (folderData.branches.length > 1) {
        bulkUpdateFolderElasticData.push({
          action: UpdateType.update,
          id: parentFolderID,
          index: folderIndexName,
          data: {
            script: {
              source: `
                ctx._source.numBranches--;
                ctx._source.branches.remove(params.branch);
                ctx._source.updated = params.currentTime;
              `,
              lang: 'painless',
              params: {
                branch,
                repository: repository.toHexString(),
                currentTime
              }
            }
          }
        });
        bulkUpdateFolderMongoData.push({
          action: UpdateType.update,
          data: {
            $pull: {
              branches: branch
            }
          },
          id: parentFolderID
        });
      } else {
        bulkUpdateFolderElasticData.push({
          action: UpdateType.delete,
          id: folderData._id,
          index: folderIndexName
        });
        bulkUpdateFolderMongoData.push({
          action: UpdateType.delete,
          filter: {
            _id: folderData._id,
            repository
          }
        });
      }
    }
  }
  await bulkSaveToMongo(bulkUpdateFolderMongoData, FolderModel);
  await bulkSaveToElastic(bulkUpdateFolderElasticData);
};

@Resolver()
class DeleteFileResolver {
  @Mutation(_returns => String)
  async deleteFile(@Args() args: DeleteFilesArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const userID = new ObjectId(ctx.auth.id);
    const user = await UserModel.findById(userID);
    if (!user) {
      throw new Error('cannot find user data');
    }
    if (!(await checkRepositoryAccess(user, args.repository, AccessLevel.edit))) {
      throw new Error('user does not have edit permissions for project or repository');
    }
    await deleteFilesUtil(args.repository, args.branch, args.files);
    return 'deleted files';
  }
}

export default DeleteFileResolver;
