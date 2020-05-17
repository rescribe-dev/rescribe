import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { getLogger } from 'log4js';
import { FileModel } from '../schema/structure/file';
import { elasticClient } from '../elastic/init';
import { fileIndexName } from '../elastic/settings';
import { ObjectId } from 'mongodb';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/auth/user';
import { checkRepositoryAccess } from '../repositories/auth';
import { AccessLevel } from '../schema/auth/access';

const logger = getLogger();

@ArgsType()
class DeleteFileArgs {
  @Field(_type => ObjectId, { description: 'file id' })
  id: ObjectId;
}

export const deleteFileUtil = async (args: DeleteFileArgs): Promise<void> => {
  const deleteElasticResult = await elasticClient.delete({
    index: fileIndexName,
    id: args.id.toHexString()
  });
  logger.info(`deleted file ${JSON.stringify(deleteElasticResult.body)}`);
  await FileModel.deleteOne({
    _id: args.id
  });
};

@Resolver()
class DeleteFileResolver {
  @Mutation(_returns => String)
  async deleteFile(@Args() args: DeleteFileArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const file = await FileModel.findById(args.id);
    if (!file) {
      throw new Error(`cannot find file with id ${args.id.toHexString()}`);
    }
    const userID = new ObjectId(ctx.auth.id);
    const user = await UserModel.findById(userID);
    if (!user) {
      throw new Error('cannot find user data');
    }
    if (!checkRepositoryAccess(user, file.project, file.repository, AccessLevel.edit)) {
      throw new Error('user does not have edit permissions for project or repository');
    }
    await deleteFileUtil(args);
    return `deleted file with id: ${args.id}`;
  }
}

export default DeleteFileResolver;
