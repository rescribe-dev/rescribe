import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { repositoryIndexName, fileIndexName, folderIndexName } from '../elastic/settings';
import { elasticClient } from '../elastic/init';
import { ObjectId } from 'mongodb';
import { RepositoryModel } from '../schema/structure/repository';
import { getLogger } from 'log4js';
import { verifyLoggedIn } from '../auth/checkAuth';
import { GraphQLContext } from '../utils/context';
import { checkRepositoryAccess } from './auth';
import { AccessLevel } from '../schema/auth/access';
import { UserModel } from '../schema/auth/user';
import { SaveElasticElement, bulkSaveToElastic } from '../elastic/elastic';
import { WriteMongoElement, bulkSaveToMongo } from '../db/mongo';
import { FileModel } from '../schema/structure/file';
import { WriteType } from '../files/shared';
import { s3Client, fileBucket, getFileKey } from '../utils/aws';
import { FolderModel } from '../schema/structure/folder';

@ArgsType()
class DeleteRepositoryArgs {
  @Field(_type => ObjectId, { description: 'repository id' })
  id: ObjectId;
}

const logger = getLogger();

export const deleteAllFilesUtil = async (repository: ObjectId): Promise<void> => {
  // also deletes base folder
  // only called when deleting the repository
  const bulkUpdateFileElasticData: SaveElasticElement[] = [];
  const bulkUpdateFileMongoData: WriteMongoElement[] = [];
  const allFileData = await FileModel.find({
    repository
  });
  for (const fileData of allFileData) {
    bulkUpdateFileElasticData.push({
      action: WriteType.delete,
      id: fileData._id,
      index: fileIndexName
    });
    bulkUpdateFileMongoData.push({
      action: WriteType.delete,
      filter: {
        _id: fileData._id,
        repository
      }
    });
    await s3Client.deleteObject({
      Bucket: fileBucket,
      Key: getFileKey(repository, fileData._id)
    }).promise();
  }
  await bulkSaveToMongo(bulkUpdateFileMongoData, FolderModel);
  await bulkSaveToElastic(bulkUpdateFileElasticData);

  const bulkUpdateFolderElasticData: SaveElasticElement[] = [];
  const bulkUpdateFolderMongoData: WriteMongoElement[] = [];
  const allFolderData = await FolderModel.find({
    repository
  });
  for (const folderData of allFolderData) {
    bulkUpdateFolderElasticData.push({
      action: WriteType.delete,
      id: folderData._id,
      index: folderIndexName
    });
    bulkUpdateFolderMongoData.push({
      action: WriteType.delete,
      filter: {
        _id: folderData._id,
        repository
      }
    });
  }
  await bulkSaveToMongo(bulkUpdateFolderMongoData, FolderModel);
  await bulkSaveToElastic(bulkUpdateFolderElasticData);
};

export const deleteRepositoryUtil = async (args: DeleteRepositoryArgs, userID: ObjectId): Promise<void> => {
  const deleteElasticResult = await elasticClient.delete({
    index: repositoryIndexName,
    id: args.id.toHexString()
  });
  logger.info(`deleted repository ${JSON.stringify(deleteElasticResult.body)}`);
  await RepositoryModel.deleteOne({
    _id: args.id
  });
  await UserModel.updateOne({
    _id: userID
  }, {
    $pull: {
      repositories: {
        _id: args.id
      }
    }
  });
  await deleteAllFilesUtil(args.id);
};

@Resolver()
class DeleteRepositoryResolver {
  @Mutation(_returns => String)
  async deleteRepository(@Args() args: DeleteRepositoryArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const repository = await RepositoryModel.findById(args.id);
    if (!repository) {
      throw new Error(`cannot find repository with id ${args.id.toHexString()}`);
    }
    const userID = new ObjectId(ctx.auth.id);
    const user = await UserModel.findById(userID);
    if (!user) {
      throw new Error('cannot find user data');
    }
    if (!(await checkRepositoryAccess(user, repository, AccessLevel.admin))) {
      throw new Error('user does not have admin permissions for project or repository');
    }
    await deleteRepositoryUtil(args, userID);
    return `deleted repository with id: ${args.id.toHexString()}`;
  }
}

export default DeleteRepositoryResolver;
