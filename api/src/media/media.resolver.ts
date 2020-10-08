import { Resolver, ArgsType, Field, Args, Ctx, Query } from 'type-graphql';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { ObjectId } from 'mongodb';
import { UserModel } from '../schema/users/user';
import { AccessLevel } from '../schema/users/access';
import Media, { MediaModel } from '../schema/structure/media';
import { checkMediaAccess, checkMediaPublic } from './auth';

@ArgsType()
class MediaArgs {
  @Field(_type => ObjectId, { description: 'media id', nullable: true })
  id: ObjectId;
}

export const getMedia = async (args: MediaArgs): Promise<Media> => {
  const media = await MediaModel.findById(args.id);
  if (!media) {
    throw new Error(`cannot find media object with id ${args.id.toHexString()}`);
  }
  return media;
};

export const getMediaAuthenticated = async (args: MediaArgs, ctx: GraphQLContext): Promise<Media> => {
  const media = await getMedia(args);
  if (await checkMediaPublic(media, AccessLevel.view)) {
    return media;
  }
  if (!verifyLoggedIn(ctx) || !ctx.auth) {
    throw new Error('user not logged in');
  }
  const userID = new ObjectId(ctx.auth.id);
  const user = await UserModel.findById(userID);
  if (!user) {
    throw new Error('cannot find user data');
  }
  if (!(await checkMediaAccess(user, media._id, AccessLevel.view))) {
    throw new Error('user not authorized to view media');
  }
  return media;
};

@Resolver()
class MediaResolver {
  @Query(_returns => Media)
  async media(@Args() args: MediaArgs, @Ctx() ctx: GraphQLContext): Promise<Media> {
    return await getMediaAuthenticated(args, ctx);
  }
}

export default MediaResolver;
