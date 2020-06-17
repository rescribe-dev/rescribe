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
import { Matches, IsNotIn } from 'class-validator';
import { countRepositories } from './repositoryNameExists.resolver';
import { validRepositoryName, blacklistedRepositoryNames } from '../utils/variables';

@ArgsType()
class AddRepositoryArgs {
  @Field(_type => String, { description: 'repository name' })
  @IsNotIn(blacklistedRepositoryNames, { message: 'repository name is in blacklist' })
  @Matches(validRepositoryName, {
    message: 'invalid characters provided for repository name'
  })
  name: string;
  @Field(_type => ObjectId, { description: 'project' })
  project: ObjectId;
  @Field(_type => AccessLevel, { description: 'public access level' })
  publicAccess: AccessLevel;
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
    if (!(await checkProjectAccess(user, args.project, AccessLevel.edit))) {
      throw new Error('user does not have edit permissions for project');
    }
    if ((await countRepositories(user, args.name)) > 0) {
      throw new Error('repository already exists');
    }
    const id = new ObjectId();
    const currentTime = new Date().getTime();
    const baseRepository: BaseRepository = {
      name: args.name,
      owner: userID,
      branches: [],
      project: args.project,
      public: args.publicAccess,
    };
    const elasticRepository: Repository = {
      created: currentTime,
      updated: currentTime,
      numBranches: 0,
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
      level: AccessLevel.owner,
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
      _id: id,
      image: ''
    };
    await new RepositoryModel(dbRepository).save();
    return `indexed repository with id ${id.toHexString()}`;
  }
}

export default AddRepositoryResolver;