import AWS from 'aws-sdk';

export const deleteObjects = async (s3Client: AWS.S3, s3Bucket: string, path: string): Promise<void> => {
  let truncated = true;
  while (truncated) {
    const data = await s3Client.listObjects({
      Bucket: s3Bucket,
      Prefix: path
    }).promise();
    if (!data.Contents) {
      throw new Error('no data found');
    }
    for (let i = 0; i < data.Contents.length; i++) {
      if (!data.Contents[i].Key) {
        throw new Error('cannot find key for content');
      }
      await s3Client.deleteObject({
        Bucket: s3Bucket,
        Key: data.Contents[i].Key as string
      }).promise();
  
      if (!data.Contents) {
        throw new Error('no data found');
      }
    }
    truncated = data.IsTruncated === true;
  }
};
