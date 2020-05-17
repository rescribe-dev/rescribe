import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { repositoryIndexName } from '../elastic/settings';
import { elasticClient } from '../elastic/init';
import { ObjectId } from 'mongodb';
import { Repository, BaseRepository, RepositoryDB, RepositoryModel } from '../schema/structure/repository';
import { ProjectModel } from '../schema/structure/project';
import { checkProjectAccess } from '../projects/auth';
import Access, { AccessLevel, AccessType } from '../schema/auth/access';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/auth/user';

@ArgsType()
class AddRepositoryArgs {
  @Field(_type => String, { description: 'repository name' })
  name: string;
  @Field(_type => ObjectId, { description: 'project' })
  project: ObjectId;
}

@Resolver()
class AddRepositoryResolver {
  @Mutation(_returns => String)
  async addRepository(@Args() args: AddRepositoryArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const userID = new ObjectId(ctx.auth.id);
    const user = await UserModel.findById(userID);
    if (!user) {
      throw new Error('cannot find user data');
    }
    if (!checkProjectAccess(user, args.project, AccessLevel.edit)) {
      throw new Error('user does not have edit permissions for project');
    }
    const id = new ObjectId();
    const currentTime = new Date().getTime();
    const baseRepository: BaseRepository = {
      name: args.name,
      branches: [],
      project: args.project,
      access: []
    };
    const elasticRepository: Repository = {
      created: currentTime,
      updated: currentTime,
      ...baseRepository
    };
    await elasticClient.index({
      id: id.toHexString(),
      index: repositoryIndexName,
      body: elasticRepository
    });
    await ProjectModel.updateOne({
      _id: args.project
    }, {
      $addToSet: {
        repositories: id
      }
    });
    const newAccess :Access = {
      _id: id,
      level: AccessLevel.admin,
      type: AccessType.user
    };
    await UserModel.updateOne({
      _id: userID
    }, {
      $addToSet: {
        repositories: newAccess
      }
    });
    const dbRepository: RepositoryDB = {
      ...baseRepository,
      _id: id
    };
    await new RepositoryModel(dbRepository).save();
    return `indexed repository with id ${id.toHexString()}`;
  }
}

export default AddRepositoryResolver;