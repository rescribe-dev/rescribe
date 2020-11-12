import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { getFileAuthenticated } from './file.resolver';
import { verifyLoggedIn } from '../auth/checkAuth';
import { GraphQLContext } from '../utils/context';
import { Aggregates, CombinedWriteData, indexFile, saveChanges } from './shared';
import { WriteType } from '../utils/writeType';
import { WriteMongoElement } from '../db/mongo';
import { SaveElasticElement } from '../elastic/elastic';
import { saveAggregates } from './deleteFiles.resolver';

@ArgsType()
class EditFileTextArgs {
  @Field(_type => ObjectId, { description: 'file ID' })
  id: ObjectId;

  @Field(_type => String, { description: 'branch' })
  branch: string;

  @Field(_type => [String], { description: 'files' })
  fileText: string[];
}

@Resolver()
class EditFileTextResolver {
  @Mutation(_returns => String)
  async editFileText(@Args() args: EditFileTextArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const fileData = await getFileAuthenticated({
      id: args.id,
    }, ctx);

    const fileMongoWrites: WriteMongoElement[] = [];
    const fileElasticWrites: SaveElasticElement[] = [];
    const fileWrites: CombinedWriteData[] = [];
    const aggregates: Aggregates = {
      linesOfCode: 0,
      numberOfFiles: 0
    };

    const newText = args.fileText.join('\n');
    await indexFile({
      action: WriteType.update,
      repository: fileData.repository,
      branch: args.branch,
      path: fileData.path,
      fileName: fileData.name,
      public: fileData.public,
      buffer: Buffer.from(newText, 'utf-8'),
      encoding: 'utf-8',
      mimeType: fileData.mime,
      isBinary: false,
      fileElasticWrites: fileElasticWrites,
      fileMongoWrites: fileMongoWrites,
      fileWrites: fileWrites,
      aggregates: aggregates,
    });
    
    await saveChanges({
      branch: args.branch,
      repositoryID: fileData.repository,
      fileElasticWrites,
      fileMongoWrites,
      fileWrites,
      folderMongoWrites: [],
      folderElasticWrites: [],
      folderWrites: []
    });
    await saveAggregates(aggregates, fileData.repository);

    return `updated ${fileData.name}`;
  }
}

export default EditFileTextResolver;
