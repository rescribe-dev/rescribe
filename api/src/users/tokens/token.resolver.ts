import { ArgsType, Field, Args, Resolver, Query, Ctx } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { verifyLoggedIn } from '../../auth/checkAuth';
import { GraphQLContext, getToken } from '../../utils/context';
import { loginType } from '../../auth/shared';
import { validateAuthToken, getTokenKey } from './util';
import Token, { TokenModel } from '../../schema/users/token';
import { ApolloError } from 'apollo-server-express';
import { NOT_FOUND } from 'http-status-codes';

@ArgsType()
export class TokenArgs {
  @Field(_type => ObjectId, { description: 'token id' })
  id?: ObjectId;

  @Field({ description: 'token key' })
  key?: string;

  @Field({ description: 'the token' })
  token?: string;
}

@Resolver()
class TokenResolver {
  @Query(_returns => Token)
  async token(@Args() args: TokenArgs, @Ctx() ctx: GraphQLContext): Promise<Token> {
    let key: string | undefined = args.key;
    if (!args.id && !args.key) {
      if (args.token) {
        validateAuthToken(args.token);
      } else {
        if (!verifyLoggedIn(ctx) || ctx.auth?.loginType !== loginType.TOKEN) {
          throw new Error('user is not logged in');
        }
        args.token = getToken(ctx.req);
      }
      key = getTokenKey(args.token);
    }

    const tokenData = await TokenModel.findOne({
      _id: args.id ? args.id : undefined,
      key: key ? key : undefined,
    });
    if (!tokenData) {
      throw new ApolloError('cannot find token data', `${NOT_FOUND}`);
    }
    return tokenData;
  }
}

export default TokenResolver;
