import { FileUpload } from 'graphql-upload';
import { isBinaryFile } from 'isbinaryfile';
import { Resolver, ArgsType, Field, Args, Mutation } from 'type-graphql';
import { indexFile } from './shared';
import { GraphQLUpload } from 'graphql-upload';
import { ObjectId } from 'mongodb';
import { StorageType } from '../schema/file';

@ArgsType()
class IndexFilesArgs {
  @Field(_type => [String], { description: 'paths' })
  paths: string[];

  @Field(() => [GraphQLUpload], { description: 'branch' })
  files: Promise<FileUpload>[];

  @Field(_type => ObjectId, { description: 'project id' })
  project: ObjectId;

  @Field(_type => ObjectId, { description: 'repo name' })
  repository: ObjectId;

  @Field(_type => ObjectId, { description: 'branch' })
  branch: ObjectId;
}

@Resolver()
class IndexFilesResolver {
  @Mutation(_returns => String)
  async indexFiles(@Args() args: IndexFilesArgs): Promise<string> {
    return new Promise(async (resolve, reject) => {
      let numIndexed = 0;
      for (let i = 0; i < args.files.length; i++) {
        const path = args.paths[i];
        const file = await args.files[i];
        // see this: https://github.com/apollographql/apollo-server/issues/3508
        // currently added a resolution as per this:
        // https://github.com/apollographql/apollo-server/issues/3508#issuecomment-558717168
        // eventually this needs to be changed.
        const readStream = file.createReadStream();
        const data: Uint8Array[] = [];
        readStream.on('data', (chunk: Uint8Array) => data.push(chunk));
        readStream.on('error', reject);
        readStream.on('end', async () => {
          const buffer = Buffer.concat(data);
          if (await isBinaryFile(buffer)) {
            reject(new Error(`file ${file.filename} is binary`));
            return;
          }
          const content = buffer.toString('utf8');
          try {
            await indexFile(StorageType.local, args.project, args.repository, args.branch, path, file.filename, content);
            numIndexed++;
            if (numIndexed === args.files.length) {
              resolve('done indexing files');
            }
          } catch(err) {
            reject(err);
          }
        });
      }
    });
  }
}

export default IndexFilesResolver;
