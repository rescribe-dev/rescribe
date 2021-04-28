import { toSvg } from 'jdenticon';
import { s3Client } from '../utils/aws';
import { MediaModel, BaseMedia, MediaParentType } from '../schema/structure/media';
import { ObjectId } from 'mongodb';
import { getMediaKey, fileBucket } from '../utils/aws';
import { AccessLevel } from '../schema/users/access';

export const addIdenticon = async (parent: ObjectId, publicAccess: AccessLevel): Promise<ObjectId> => {
  const mediaID = new ObjectId();
  const repoAvatarName = `repo-${parent.toHexString()}-avatar.svg`;
  const avatarMime = 'image/svg+xml';
  const avatarEncoding = 'utf8';
  const avatar = toSvg(repoAvatarName, 100);

  const currentTime = new Date().getTime();

  const mediaData: BaseMedia = {
    parentType: MediaParentType.repository,
    parent,
    name: repoAvatarName,
    mime: avatarMime,
    fileSize: avatar.length,
    public: publicAccess,
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
  
  return mediaID;
};
