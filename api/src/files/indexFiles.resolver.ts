import { FileUpload } from 'graphql-upload';
import { isBinaryFile } from "isbinaryfile";
import { Resolver, ArgsType, Field, Args, Mutation } from 'type-graphql';
import { indexFile } from "./shared";
import { GraphQLUpload } from 'apollo-server-express';

@ArgsType()
class IndexFilesArgs {
  @Field(_type => [String], { description: 'paths' })
  paths: string[];

  @Field(_type => [GraphQLUpload], { description: 'branch' })
  files: Promise<FileUpload>[];

  @Field(_type => String, { description: 'repo name' })
  repository: string;

  @Field(_type => String, { description: 'branch' })
  branch: string;
}

@Resolver()
class IndexFilesResolver {
  @Mutation(_returns => String)
  async indexFiles(@Args() args: IndexFilesArgs): Promise<string> {
    return new Promise(async (resolve, reject) => {
      let numIndexed = 0;
      for (let i = 0; i < args.files.length; i++) {
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
          await indexFile(content, file.filename);
          numIndexed++;
          if (numIndexed === args.files.length) {
            resolve(content);
          }
        });
      }
    });
  }
}

export default IndexFilesResolver;
