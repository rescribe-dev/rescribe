import { ObjectId } from 'mongodb';
import { Resolver, Ctx, Query, ArgsType, Field, Args } from 'type-graphql';
import { GraphQLContext } from '../utils/context';
import User, { UserModel, PublicUser } from '../schema/users/user';
import { verifyLoggedIn } from '../auth/checkAuth';
import { ApolloError } from 'apollo-server-express';
import statusCodes from 'http-status-codes';

@ArgsType()
class PublicUserArgs {
  @Field(_type => ObjectId, { description: 'project id', nullable: true })
  id?: ObjectId;

  @Field({ description: 'project name', nullable: true })
  username?: string;
}

@Resolver()
class PublicUserResolver {
  @Query(_type => PublicUser, { description: 'public user data' })
  async publicUser(@Args() args: PublicUserArgs, @Ctx() ctx: GraphQLContext): Promise<PublicUser> {
    let user: User | null;
    if (args.id) {
      user = await UserModel.findById(args.id);
    } else if (args.username) {
      user = await UserModel.findOne({
        username: args.username
      });
    } else if (verifyLoggedIn(ctx) && ctx.auth) {
      user = await UserModel.findById(ctx.auth.id);
    } else {
      throw new ApolloError('no username or id provided, and not logged in', `${statusCodes.NOT_FOUND}`);
    }
    if (!user) {
      throw new ApolloError('cannot find user', `${statusCodes.NOT_FOUND}`);
    }
    return user as PublicUser;
  }
}

export default PublicUserResolver;
