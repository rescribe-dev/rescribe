import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { repositoryIndexName, projectIndexName } from '../elastic/settings';
import { elasticClient } from '../elastic/init';
import { ObjectId } from 'mongodb';
import { Repository, BaseRepository, RepositoryDB, RepositoryModel } from '../schema/structure/repository';
import { MediaModel, BaseMedia, MediaParentType } from '../schema/structure/media';
import { ProjectModel } from '../schema/structure/project';
import { checkProjectAccess } from '../projects/auth';
import Access, { AccessLevel, AccessType } from '../schema/users/access';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/users/user';
import { Matches, IsNotIn, MinLength } from 'class-validator';
import { countRepositoriesUserAccess } from './repositoryNameExists.resolver';
import { validRepositoryName, blacklistedRepositoryNames } from '../shared/variables';
import { baseFolderName, baseFolderPath } from '../shared/folders';
import { createFolder } from '../folders/addFolder.resolver';
import { toSvg } from 'jdenticon';
import { getMediaKey, fileBucket } from '../utils/aws';
import { s3Client } from '../utils/aws';

@ArgsType()
class AddRepositoryArgs {
  @Field(_type => String, { description: 'repository name' })
  @MinLength(1, {
    message: 'repository name length must be greater than 0'
  })
  @IsNotIn(blacklistedRepositoryNames, { message: 'repository name is in blacklist' })
  @Matches(validRepositoryName, {
    message: 'invalid characters provided for repository name'
  })
  name: string;

  @Field(_type => ObjectId, { description: 'project', nullable: true })
  project?: ObjectId;

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
    if (args.project && !(await checkProjectAccess(user, args.project, AccessLevel.edit))) {
      throw new Error('user does not have edit permissions for project');
    }
    args.name = args.name.toLowerCase();
    if ((await countRepositoriesUserAccess(user, args.name)) > 0) {
      throw new Error('repository already exists');
    }
    const id = new ObjectId();
    const currentTime = new Date().getTime();
    const folder = await createFolder({
      name: baseFolderName,
      path: baseFolderPath,
      public: args.publicAccess,
      parent: id,
      repository: id,
      branches: []
    });

    const mediaID = new ObjectId();
    const repoAvatarName = `repo-${id.toHexString()}-avatar.svg`;
    const avatarMime = 'image/svg+xml';
    const avatarEncoding = 'utf8';
    const avatar = toSvg(repoAvatarName, 100);
    const mediaData: BaseMedia = {
      parentType: MediaParentType.repository,
      parent: id,
      name: repoAvatarName,
      mime: avatarMime,
      fileSize: avatar.length,
      public: args.publicAccess,
      created: currentTime,
      updated: currentTime,
    };

    await s3Client.upload({
      Bucket: fileBucket,
      Key: getMediaKey(mediaID),
      Body: Buffer.from(avatar, avatarEncoding),
      ContentType: avatarMime,
      ContentEncoding: avatarEncoding,
    }).promise();

    await new MediaModel({
      ...mediaData,
      _id: mediaID
    }).save();

    const baseRepository: BaseRepository = {
      name: args.name,
      owner: userID,
      branches: [],
      public: args.publicAccess,
      image: mediaID,
      linesOfCode: 0,
      numberOfFiles: 0,
      folder: folder._id,
      created: currentTime,
      updated: currentTime,
    };
    if (args.project) {
      await ProjectModel.updateOne({
        _id: args.project
      }, {
        $addToSet: {
          repositories: id
        }
      });
      await elasticClient.update({
        index: projectIndexName,
        id: args.project.toHexString(),
        body: {
          script: {
            source: `
              ctx._source.repositories.add(params.repository);
            `,
            lang: 'painless',
            params: {
              repository: id.toHexString()
            }
          },
        }
      });
    }
    const elasticRepository: Repository = baseRepository;
    await elasticClient.index({
      id: id.toHexString(),
      index: repositoryIndexName,
      body: elasticRepository
    });
    const newAccess: Access = {
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
      _id: id
    };
    await new RepositoryModel(dbRepository).save();
    return `indexed repository with id ${id.toHexString()}`;
  }
}

export default AddRepositoryResolver;