import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { repositoryIndexName } from '../elastic/settings';
import { elasticClient } from '../elastic/init';
import { ObjectId } from 'mongodb';
import { RepositoryModel } from '../schema/repository';
import { getLogger } from 'log4js';
import { verifyLoggedIn } from '../auth/checkAuth';
import { GraphQLContext } from '../utils/context';
import { ProjectModel } from '../schema/project';
import { checkRepositoryAccess } from './auth';
import { AccessLevel } from '../schema/access';

@ArgsType()
class DeleteRepositoryArgs {
  @Field(_type => ObjectId, { description: 'repository id' })
  id: ObjectId;
}

const logger = getLogger();

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
    const project = await ProjectModel.findById(repository.project);
    if (!project) {
      throw new Error('cannot find parent project');
    }
    const userID = new ObjectId(ctx.auth.id);
    if (!checkRepositoryAccess(userID, repository, project, AccessLevel.admin)) {
      throw new Error('user does not have admin permissions for project or repository');
    }
    const deleteElasticResult = await elasticClient.delete({
      index: repositoryIndexName,
      id: args.id.toHexString()
    });
    logger.info(`deleted repository ${JSON.stringify(deleteElasticResult.body)}`);
    await RepositoryModel.deleteOne({
      _id: args.id
    });
    return `deleted repository with id: ${args.id.toHexString()}`;
  }
}

export default DeleteRepositoryResolver;
