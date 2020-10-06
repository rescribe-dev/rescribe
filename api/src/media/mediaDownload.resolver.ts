import { ObjectId } from 'mongodb';
import { Resolver, FieldResolver, ResolverInterface, Root } from 'type-graphql';
import { DownloadLinks } from '../schema/structure/baseFile';
import Media from '../schema/structure/media';
import { fileBucket, getMediaKey, getS3DownloadSignedURL } from '../utils/aws';


@Resolver(_of => Media)
class DownloadLinksResolver implements ResolverInterface<Media> {
  @FieldResolver(_returns => DownloadLinks)
  async downloadLinks(@Root() media: Media): Promise<DownloadLinks> {
    return {
      original: await getS3DownloadSignedURL(getMediaKey(media._id as ObjectId), fileBucket),
      blurred: await getS3DownloadSignedURL(getMediaKey(media._id as ObjectId), fileBucket)
    };
  }
}

export default DownloadLinksResolver;
