import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { GraphQLUpload } from 'graphql-upload';
import { ObjectId } from 'mongodb';
import { ArrayUnique } from 'class-validator';
import { getFileAuthenticated } from './file.resolver';
import File, { FileModel } from '../schema/structure/file';
import { verifyLoggedIn } from '../auth/checkAuth';
import { GraphQLContext } from '../utils/context';

@ArgsType()
class EditFileTextArgs {
  @ArrayUnique({
    message: 'all paths must be unique'
  })
  @Field(_type => [ObjectId], { description: 'file ID' })
  id: ObjectId;

  @Field(_type => [GraphQLUpload], { description: 'files' })
  fileText: String[];
}

@Resolver()
class EditFileTextResolver {
  @Mutation(_returns => File)
  async indexFiles(@Args() args: EditFileTextArgs, @Ctx() ctx: GraphQLContext): Promise<File> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }

    const fileData = await getFileAuthenticated({
      id: args.id, 
    }, ctx);

    const newContent = args.fileText.join('\n');
    
    await FileModel.updateOne({
      id: args.id
    }, {
      content: newContent
    });
  
    fileData.content = newContent;

    return fileData;
  }
}

export default EditFileTextResolver;
