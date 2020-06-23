import { FileUpload } from 'graphql-upload';
import { isBinaryFile } from 'isbinaryfile';
import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { indexFile, UpdateType, getFilePath } from './shared';
import { GraphQLUpload } from 'graphql-upload';
import { ObjectId } from 'mongodb';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { RepositoryModel } from '../schema/structure/repository';
import { checkRepositoryAccess } from '../repositories/auth';
import { AccessLevel } from '../schema/auth/access';
import { UserModel } from '../schema/auth/user';
import { getUser } from '../users/shared';
import { addBranchUtil } from '../branches/addBranch.resolver';
import { SaveElasticElement, bulkSaveToElastic } from '../utils/elastic';
import { WriteMongoElement, bulkSaveToMongo } from '../utils/mongo';
import { FileModel } from '../schema/structure/file';
import { FolderModel } from '../schema/structure/folder';

@ArgsType()
class IndexFilesArgs {
  @Field(_type => [String], { description: 'paths' })
  paths: string[];

  @Field(() => [GraphQLUpload], { description: 'files' })
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
    if (!(await checkRepositoryAccess(user, repository.project, repository, AccessLevel.edit))) {
      throw new Error('user does not have edit permissions for project or repository');
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
    const folderElasticWrites: { [key: string]: SaveElasticElement } = {};
    const fileWrites: WriteMongoElement[] = [];
    const folderWrites: WriteMongoElement[] = [];
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
          const isBinary = await isBinaryFile(buffer);
          const content = buffer.toString('utf8');
          try {
            await indexFile({
              action: UpdateType.add,
              file: undefined,
              project: repository.project,
              repository: repositoryID,
              branch: args.branch,
              path: getFilePath(path),
              fileName: file.filename,
              public: repository.public,
              content,
              isBinary,
              fileElasticWrites,
              fileWrites,
              folderElasticWrites,
              folderWrites
            });
            numIndexed++;
            if (numIndexed === args.files.length) {
              await bulkSaveToElastic(fileElasticWrites);
              const folderElasticWritesArray: SaveElasticElement[] = [];
              for (const path in folderElasticWrites) {
                folderElasticWritesArray.push(folderElasticWrites[path]);
              }
              await bulkSaveToElastic(folderElasticWritesArray);
              await bulkSaveToMongo(fileWrites, FileModel);
              await bulkSaveToMongo(folderWrites, FolderModel);
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
