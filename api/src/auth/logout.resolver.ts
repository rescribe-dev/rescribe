import User, { UserModel } from '../schema/user';
import { Ctx, Mutation, Resolver, ArgsType, Field, Args } from 'type-graphql';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn, verifyAdmin } from './checkAuth';
import { IsEmail, IsOptional } from 'class-validator';
import { DocumentType } from '@typegoose/typegoose';
import { clearRefreshToken } from '../utils/refreshToken';

@ArgsType()
class RevokeArgs {
  @Field(_type => String, { description: 'email', nullable: true })
  @IsOptional()
  @IsEmail({}, {
    message: 'invalid email provided'
  })
  email: string;
}

@Resolver()
export class UserResolver {
  @Mutation(_returns => String)
  logout(@Ctx() { res }: GraphQLContext): string {
    clearRefreshToken(res);
    return 'logged out';
  }

  @Mutation(_returns => String)
  async revokeRefresh(@Args() { email }: RevokeArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
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
    const userData = userFindRes;
    if (!userData.id) {
      throw new Error('no user id found');
    }
    await UserModel.updateOne({
      _id: userData.id
    }, {
      $inc: {
        tokenVersion: 1
      }
    });
    return `revoked token for ${userFindRes.id}`;
  }
}