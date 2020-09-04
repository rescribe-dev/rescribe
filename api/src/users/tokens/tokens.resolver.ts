import { ArgsType, Field, Args, Resolver, Query, Ctx } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { verifyAdmin, verifyLoggedIn } from '../../auth/checkAuth';
import { GraphQLContext } from '../../utils/context';
import Token, { TokenModel } from '../../schema/users/token';

@ArgsType()
export class TokensArgs {
  @Field(_type => ObjectId, { description: 'tokens user', nullable: true })
  user?: ObjectId;
}

@Resolver()
class TokensResolver {
  @Query(_returns => [Token])
  async tokens(@Args() args: TokensArgs, @Ctx() ctx: GraphQLContext): Promise<Token[]> {
    if (!verifyLoggedIn(ctx)) {
      throw new Error('user must be logged in');
    }
    let userID: ObjectId = new ObjectId(ctx.auth?.id);
    if (args.user) {
      if (!args.user.equals(userID) && !verifyAdmin(ctx)) {
        throw new Error('only admins can view tokens for specific users');
      }
      userID = args.user;
    }
    const tokenData = await TokenModel.find({
      user: userID
    });
    return tokenData;
  }
}

export default TokensResolver;
