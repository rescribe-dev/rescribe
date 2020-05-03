import { userCollection } from '../db/connect';
import { verifyLoggedIn } from './checkAuth';
import { ObjectID } from 'mongodb';
import { Resolver, Ctx, Query } from 'type-graphql';
import { GraphQLContext } from '../utils/context';
import User from '../schema/auth';

@Resolver()
class UserResolvers {
  @Query(_type => User, { description: "user data" })
  async user(@Ctx() ctx: GraphQLContext): Promise<User> {
    if (!verifyLoggedIn(ctx)) {
      throw new Error('user not logged in');
    }
    const userID = new ObjectID(ctx.auth?.id);
    const user = await userCollection.findOne({
      id: userID,
    });
    if (!user) {
      throw new Error(`cannot find user with id ${userID.toHexString()}`);
    }
    return user;
  }
}

export default UserResolvers;
