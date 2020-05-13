import { FileUpload } from 'graphql-upload';
import { isBinaryFile } from 'isbinaryfile';
import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { indexFile } from './shared';
import { GraphQLUpload } from 'graphql-upload';
import { ObjectId } from 'mongodb';
import { StorageType } from '../schema/file';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { RepositoryModel } from '../schema/repository';
import { ProjectModel } from '../schema/project';
import { checkRepositoryAccess } from '../repositories/auth';
import { AccessLevel } from '../schema/access';

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

  @Field({ description: 'branch', defaultValue: false })
  saveContent: boolean;
}

@Resolver()
class IndexFilesResolver {
  @Mutation(_returns => String)
  async indexFiles(@Args() args: IndexFilesArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (!verifyLoggedIn(ctx) || !ctx.auth) {
        throw new Error('user not logged in');
      }
      const repository = await RepositoryModel.findById(args.repository);
      if (!repository) {
        throw new Error(`cannot find repository with id ${args.repository.toHexString()}`);
      }
      const project = await ProjectModel.findById(repository.project);
      if (!project) {
        throw new Error('cannot find parent project');
      }
      const userID = new ObjectId(ctx.auth.id);
      if (!checkRepositoryAccess(userID, repository, project, AccessLevel.edit)) {
        throw new Error('user does not have edit permissions for project or repository');
      }
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
            await indexFile(args.saveContent, StorageType.local, args.project, args.repository, args.branch, path, file.filename, content);
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
