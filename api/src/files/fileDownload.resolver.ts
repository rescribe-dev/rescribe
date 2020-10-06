import { ObjectId } from 'mongodb';
import { Resolver, FieldResolver, ResolverInterface, Root } from 'type-graphql';
import File from '../schema/structure/file';
import { fileBucket, getFileKey, getS3DownloadSignedURL } from '../utils/aws';


@Resolver(_of => File)
class FileDownload implements ResolverInterface<File> {
  @FieldResolver()
  async downloadLink(@Root() file: File): Promise<string> {
    return await getS3DownloadSignedURL(getFileKey(file.repository, file._id as ObjectId), fileBucket);
  }
}

export default FileDownload;
