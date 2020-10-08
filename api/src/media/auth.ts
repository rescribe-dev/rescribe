import { ObjectId } from 'mongodb';
import { checkAccess, checkAccessLevel } from '../auth/checkAccess';
import { AccessLevel } from '../schema/users/access';
import User from '../schema/users/user';
import Media, { MediaModel, MediaParentType } from '../schema/structure/media';

export const checkMediaPublic = async (media: ObjectId | Media, accessLevel: AccessLevel): Promise<boolean> => {
  if (media instanceof ObjectId) {
    const mediaData = await MediaModel.findById(media);
    if (!mediaData) {
      throw new Error(`cannot find media ${media.toHexString()}`);
    }
    media = mediaData;
  }
  return checkAccessLevel(media.public, accessLevel);
};

export const checkMediaAccess = async (user: User, media: ObjectId | Media, accessLevel: AccessLevel): Promise<boolean> => {
  if (media instanceof ObjectId) {
    const mediaData = await MediaModel.findById(media);
    if (!mediaData) {
      throw new Error(`cannot find media ${media.toHexString()}`);
    }
    media = mediaData;
  }
  if (checkAccessLevel(media.public, accessLevel)) {
    return true;
  }
  switch (media.parentType) {
    case MediaParentType.User:
      return user._id === media.parent;
    case MediaParentType.Repository:
      return !checkAccess(media.parent, user.repositories, AccessLevel.none) &&
      checkAccess(media.parent, user.repositories, accessLevel);
    default:
      throw new Error('unhandled media parent type provided');
  }
};
