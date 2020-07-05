import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { fileIndexName, folderIndexName, repositoryIndexName } from '../elastic/settings';
import { ObjectId } from 'mongodb';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/auth/user';
import { checkRepositoryAccess } from '../repositories/auth';
import { AccessLevel } from '../schema/auth/access';
import { s3Client, fileBucket, getFileKey } from '../utils/aws';
import { SaveElasticElement, bulkSaveToElastic } from '../elastic/elastic';
import { WriteType, Aggregates, FileWriteData, singleBranchRemove } from './shared';
import { WriteMongoElement, bulkSaveToMongo } from '../db/mongo';
import { FileModel, FileDB } from '../schema/structure/file';
import { FolderModel } from '../schema/structure/folder';
import { baseFolderName, baseFolderPath } from '../shared/folders';
import { RepositoryModel } from '../schema/structure/repository';
import { elasticClient } from '../elastic/init';
import { getLogger } from 'log4js';

const logger = getLogger();

@ArgsType()
class DeleteFilesArgs {
  @Field(_type => [ObjectId], { description: 'file ids' })
  files: ObjectId[];

  @Field(_type => ObjectId, { description: 'repository id' })
  repository: ObjectId;

  @Field(_type => String, { description: 'branch name' })
  branch: string;
}

interface DeleteFilesUtilArgs {
  repository: ObjectId;
  branch: string;
  files?: ObjectId[] | string[] | FileDB[];
  aggregates?: Aggregates;
  bulkUpdateFileElasticData?: SaveElasticElement[];
  bulkUpdateFileMongoData?: WriteMongoElement[];
  bulkUpdateFileWrites?: FileWriteData[];
}

export const deleteFilesUtil = async (args: DeleteFilesUtilArgs): Promise<void> => {
  // does not delete base folder
  const runBulkUpdateElastic = args.bulkUpdateFileElasticData === undefined;
  if (!args.bulkUpdateFileElasticData) {
    args.bulkUpdateFileElasticData = [];
  }
  const runBulkUpdateMongo = args.bulkUpdateFileMongoData === undefined;
  if (!args.bulkUpdateFileMongoData) {
    args.bulkUpdateFileMongoData = [];
  }
  const currentTime = new Date().getTime();
  let fileFilter: Record<string, unknown> = {
    repository: args.repository,
    branches: args.branch
  };
  // get all file data within scope
  let allFileData: FileDB[] | undefined = undefined;
  if (args.files) {
    if (args.files.length === 0) return;
    if (args.files[0] instanceof ObjectId) {
      // file id
      fileFilter = {
        ...fileFilter,
        _id: {
          $in: args.files
        }
      };
    } else if (args.files[0] instanceof String) {
      // path
      fileFilter = {
        ...fileFilter,
        path: {
          $in: args.files
        }
      };
    } else {
      // FileDB
      allFileData = args.files as FileDB[];
    }
  }
  if (!allFileData) {
    allFileData = await FileModel.find(fileFilter);
  }
  for (const fileData of allFileData) {
    if (fileData.branches.length === 1) {
      // remove file completely
      const elasticWrite: SaveElasticElement = {
        action: WriteType.delete,
        id: fileData._id,
        index: fileIndexName
      };
      args.bulkUpdateFileElasticData.push(elasticWrite);
      const mongoWrite: WriteMongoElement = {
        action: WriteType.delete,
        filter: {
          _id: fileData._id,
          repository: args.repository
        }
      };
      args.bulkUpdateFileMongoData.push(mongoWrite);
      await s3Client.deleteObject({
        Bucket: fileBucket,
        Key: getFileKey(args.repository, fileData._id)
      }).promise();
      if (args.bulkUpdateFileWrites) {
        args.bulkUpdateFileWrites.push({
          elastic: elasticWrite,
          mongo: mongoWrite
        });
      }
      if (args.aggregates) {
        args.aggregates.linesOfCode -= fileData.fileLength;
        args.aggregates.numberOfFiles--;
      }
    } else {
      // remove branch from file
      singleBranchRemove({
        id: fileData._id,
        currentTime,
        aggregates: args.aggregates,
        branch: args.branch,
        fileElasticWrites: args.bulkUpdateFileElasticData,
        fileMongoWrites: args.bulkUpdateFileMongoData,
        fileWrites: args.bulkUpdateFileWrites
      });
    }
  }

  // get all parent folders
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
    const numChildren = await FileModel.countDocuments({
      folder: parentFolderID,
      repository: args.repository,
      branches: {
        $all: [args.branch]
      }
    });
    if (numChildren === 1) {
      // remove branch from folder
      const folderData = await FolderModel.findById(parentFolderID);
      if (!folderData) {
        throw new Error(`cannot find folder with id ${parentFolderID.toHexString()}`);
      }
      if (folderData.branches.length > 1) {
        // remove branch from folder
        const elasticWrite: SaveElasticElement = {
          action: WriteType.update,
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
                branch: args.branch,
                repository: args.repository.toHexString(),
                currentTime
              }
            }
          }
        };
        bulkUpdateFolderElasticData.push(elasticWrite);
        const mongoWrite: WriteMongoElement = {
          action: WriteType.update,
          data: {
            $pull: {
              branches: args.branch
            }
          },
          id: parentFolderID
        };
        bulkUpdateFolderMongoData.push(mongoWrite);
        if (args.bulkUpdateFileWrites) {
          args.bulkUpdateFileWrites.push({
            elastic: elasticWrite,
            mongo: mongoWrite
          });
        }
      } else {
        // delete folder because it is now empty
        const elasticWrite: SaveElasticElement = {
          action: WriteType.delete,
          id: folderData._id,
          index: folderIndexName
        };
        bulkUpdateFolderElasticData.push(elasticWrite);
        const mongoWrite: WriteMongoElement = {
          action: WriteType.delete,
          filter: {
            _id: folderData._id,
            repository: args.repository
          }
        };
        bulkUpdateFolderMongoData.push(mongoWrite);
        if (args.bulkUpdateFileWrites) {
          args.bulkUpdateFileWrites.push({
            elastic: elasticWrite,
            mongo: mongoWrite
          });
        }
      }
    }
  }
  if (runBulkUpdateMongo) {
    await bulkSaveToMongo(bulkUpdateFolderMongoData, FolderModel);
  }
  if (runBulkUpdateElastic) {
    await bulkSaveToElastic(bulkUpdateFolderElasticData);
  }
};

export const saveAggregates = async (aggregates: Aggregates, repository: ObjectId): Promise<void> => {
  const currentTime = new Date().getTime();
  logger.info('save start');
  await elasticClient.update({
    index: repositoryIndexName,
    id: repository.toHexString(),
    body: {
      doc: {
        currentTime,
        ...aggregates
      }
    }
  });
  logger.info('save next');
  await RepositoryModel.updateOne({
    _id: repository
  }, {
    $set: {
      currentTime,
      ...aggregates
    }
  });
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
    const repository = await RepositoryModel.findById(args.repository);
    if (!repository) {
      throw new Error(`cannot find repository with id ${args.repository.toHexString()}`);
    }
    if (!(await checkRepositoryAccess(user, repository, AccessLevel.edit))) {
      throw new Error('user does not have edit permissions for project or repository');
    }
    const aggregates: Aggregates = {
      linesOfCode: repository.linesOfCode,
      numberOfFiles: repository.numberOfFiles
    };
    await deleteFilesUtil({
      ...args,
      aggregates
    });
    await saveAggregates(aggregates, repository._id);
    return 'deleted files';
  }
}

export default DeleteFileResolver;
