import { ObjectId } from 'mongodb';
import { Resolver, FieldResolver, ResolverInterface, Root } from 'type-graphql';
import { DownloadLinks } from '../schema/structure/baseFile';
import File from '../schema/structure/file';
import { fileBucket, getFileKey, getS3DownloadSignedURL } from '../utils/aws';


@Resolver(_of => File)
class DownloadLinksResolver implements ResolverInterface<File> {
  @FieldResolver(_returns => DownloadLinks)
  async downloadLinks(@Root() file: File): Promise<DownloadLinks> {
    return {
      original: await getS3DownloadSignedURL(getFileKey(file.repository, file._id as ObjectId), fileBucket),
      blurred: await getS3DownloadSignedURL(getFileKey(file.repository, file._id as ObjectId), fileBucket)
    };
  }
}

export default DownloadLinksResolver;
