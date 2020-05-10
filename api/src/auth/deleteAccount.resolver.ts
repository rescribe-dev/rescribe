
import { verifyAdmin, verifyLoggedIn } from "./checkAuth";
import { userCollection } from '../db/connect';
import { GraphQLContext } from '../utils/context';
import { Resolver, ArgsType, Field, Args, Ctx, Mutation } from 'type-graphql';
import { IsEmail, IsOptional } from "class-validator";
import { ObjectId } from "mongodb";

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
class RegisterResolver {
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
    const filter: any = {};
    if (!isAdmin) {
      filter.id = new ObjectId(ctx.auth?.id);
    } else {
      filter.email = email;
    }
    const userFindRes = await userCollection.findOne(filter);
    if (!userFindRes) {
      throw new Error('no user found');
    }
    const userData = userFindRes;
    if (!userData.id) {
      throw new Error('no user id found');
    }
    await userCollection.deleteOne({
      id: userData.id
    });
    return `deleted user ${userData.id.toHexString()}`;
  }
}

export default RegisterResolver;
