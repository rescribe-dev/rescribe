import { FileUpload } from 'graphql-upload';
import { isBinaryFile } from 'isbinaryfile';
import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { indexFile, saveChanges, CombinedWriteData, Aggregates } from './shared';
import { GraphQLUpload } from 'graphql-upload';
import { ObjectId } from 'mongodb';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { RepositoryModel } from '../schema/structure/repository';
import { checkRepositoryAccess } from '../repositories/auth';
import { AccessLevel } from '../schema/users/access';
import { UserModel } from '../schema/users/user';
import { getUser } from '../users/shared';
import { addBranchUtil } from '../branches/addBranch.resolver';
import { ArrayUnique } from 'class-validator';
import { SaveElasticElement } from '../elastic/elastic';
import { WriteMongoElement } from '../db/mongo';
import { saveAggregates } from './deleteFiles.resolver';
import { getFilePath } from '../shared/files';
import { WriteType } from '../utils/writeType';
import { maxFileUploadSize } from '../utils/variables';

@ArgsType()
class IndexFilesArgs {
  @ArrayUnique({
    message: 'all paths must be unique'
  })
  @Field(_type => [String], { description: 'paths' })
  paths: string[];

  @Field(_type => [GraphQLUpload], { description: 'files' })
  files: Promise<FileUpload>[];

  @Field({ description: 'repository name' })
  repository: string;

  @Field({ description: 'repository owner' })
  owner: string;

  @Field(_type => String, { description: 'branch' })
  branch: string;

  @Field({ description: 'create branch automatically', defaultValue: false })
  autoCreateBranch: boolean;
}

@Resolver()
class IndexFilesResolver {
  @Mutation(_returns => String)
  async indexFiles(@Args() args: IndexFilesArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const owner = await getUser(args.owner);
    const repository = await RepositoryModel.findOne({
      name: args.repository,
      owner: owner._id
    });
    if (!repository) {
      throw new Error(`cannot find repository ${args.repository}`);
    }
    if (!repository.id) {
      throw new Error('repository does not have id');
    }
    const repositoryID = new ObjectId(repository.id);
    const userID = new ObjectId(ctx.auth.id);
    const user = await UserModel.findById(userID);
    if (!user) {
      throw new Error('cannot find user data');
    }
    if (!(await checkRepositoryAccess(user, repository, AccessLevel.edit))) {
      throw new Error('user does not have edit permissions or repository');
    }
    if (!repository.branches.includes(args.branch)) {
      if (!args.autoCreateBranch) {
        throw new Error(`repository does not contain branch ${args.branch}`);
      }
      await addBranchUtil({
        name: args.branch,
        repository: repositoryID
      });
    }

    const fileElasticWrites: SaveElasticElement[] = [];
    const fileMongoWrites: WriteMongoElement[] = [];
    const fileWrites: CombinedWriteData[] = [];
    const aggregates: Aggregates = {
      linesOfCode: 0,
      numberOfFiles: 0
    };
    const folderElasticWrites: SaveElasticElement[] = [];
    const folderMongoWrites: WriteMongoElement[] = [];
    const folderWrites: CombinedWriteData[] = [];

    return new Promise(async (resolve, reject) => {
      let numIndexed = 0;
      for (let i = 0; i < args.files.length; i++) {
        const path = args.paths[i];
        const file = await args.files[i];
        const readStream = file.createReadStream();
        if (readStream.readableLength > maxFileUploadSize) {
          throw new Error(`file ${file.filename} is larger than the max file size of ${maxFileUploadSize} bytes`);
        }
        const data: Uint8Array[] = [];
        readStream.on('data', (chunk: Uint8Array) => data.push(chunk));
        readStream.on('error', reject);
        readStream.on('end', async () => {
          const buffer = Buffer.concat(data);
          const isBinary = await isBinaryFile(buffer);
          try {
            await indexFile({
              action: WriteType.add,
              repository: repositoryID,
              branch: args.branch,
              path: getFilePath(path).path,
              fileName: file.filename,
              public: repository.public,
              buffer,
              encoding: file.encoding,
              mimeType: file.mimetype,
              isBinary,
              fileElasticWrites,
              fileMongoWrites,
              fileWrites,
              aggregates,
            });
            numIndexed++;
            if (numIndexed === args.files.length) {
              await saveChanges({
                branch: args.branch,
                repositoryID,
                fileElasticWrites,
                fileMongoWrites,
                fileWrites,
                folderMongoWrites,
                folderElasticWrites,
                folderWrites
              });
              await saveAggregates(aggregates, repository._id);
              resolve('done indexing files');
            }
          } catch (err) {
            reject(err);
          }
        });
      }
    });
  }
}

export default IndexFilesResolver;
