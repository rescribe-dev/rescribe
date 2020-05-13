
import { verifyAdmin, verifyLoggedIn } from './checkAuth';
import { GraphQLContext } from '../utils/context';
import { Resolver, ArgsType, Field, Args, Ctx, Mutation } from 'type-graphql';
import { IsEmail, IsOptional } from 'class-validator';
import User, { UserModel } from '../schema/user';
import { DocumentType } from '@typegoose/typegoose';

@ArgsType()
class DeleteArgs {
  @Field(_type => String, { description: 'email', nullable: true })
  @IsOptional()
  @IsEmail({}, {
    message: 'invalid email provided'
  })
  email: string;
}

@Resolver()
class DeleteResolver {
  @Mutation(_returns => String)
  async deleteAccount(@Args() { email }: DeleteArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    const isAdmin = email !== undefined;
    if (isAdmin) {
      if (!verifyAdmin(ctx)) {
        throw new Error('user not admin');
      }
    } else {
      if (!verifyLoggedIn(ctx)) {
        throw new Error('user not logged in');
      }
    }
    let userFindRes: DocumentType<User> | null;
    if (!isAdmin) {
      userFindRes = await UserModel.findById(ctx.auth?.id);
    } else {
      userFindRes = await UserModel.findOne({
        email
      });
    }
    if (!userFindRes) {
      throw new Error('no user found');
    }
    const userData = userFindRes as User;
    const deleteRes = await UserModel.deleteOne({
      _id: userData._id
    });
    if (!deleteRes.ok) {
      throw new Error('could not delete user');
    }
    return `deleted user ${userData._id.toHexString()}`;
  }
}

export default DeleteResolver;
