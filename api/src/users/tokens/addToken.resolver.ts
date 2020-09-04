import { Resolver, Field, Args, Mutation, Ctx, ArgsType, Int } from 'type-graphql';
import { GraphQLContext } from '../../utils/context';
import { verifyLoggedIn } from '../../auth/checkAuth';
import { ObjectId } from 'mongodb';
import ReturnObj from '../../schema/utils/returnObj';
import Token, { Scope, TokenModel } from '../../schema/users/token';
import { async as cryptoRandomString } from 'crypto-random-string';
import argon2 from 'argon2';
import { nanoid } from 'nanoid';
import { randomComponentLen, keyComponentLen } from './util';
import { ApolloError } from 'apollo-server-express';
import { FORBIDDEN } from 'http-status-codes';

// number of days for default duration
const defaultDuration = 1000 * 60 * 60 * 24 * 5;

@ArgsType()
class AddTokenArgs {
  @Field({ description: 'token name' })
  notes: string;

  @Field(_type => Int, { description: 'how long the token is valid for (in seconds)', nullable: true })
  expires?: number;

  @Field(_type => [Scope], { description: 'access scopes', nullable: true })
  scopes: Scope[];
}

@Resolver()
class AddTokenResolver {
  @Mutation(_returns => ReturnObj)
  async addToken(@Args() args: AddTokenArgs, @Ctx() ctx: GraphQLContext): Promise<ReturnObj> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new ApolloError('user not logged in', `${FORBIDDEN}`);
    }
    const userID = new ObjectId(ctx.auth.id);
    const currentTime = new Date().getTime();
    const randomStr = await cryptoRandomString({
      length: randomComponentLen,
      type: 'url-safe'
    });
    const tokenKey = nanoid(keyComponentLen);
    const token = tokenKey + randomStr;
    const hashedToken = await argon2.hash(token);
    if (!args.expires) {
      const expirationDate = new Date();
      expirationDate.setTime(expirationDate.getTime() + defaultDuration);
      args.expires = expirationDate.getTime();
    }
    const newToken: Token = {
      _id: new ObjectId(),
      created: currentTime,
      updated: currentTime,
      expires: args.expires,
      notes: args.notes,
      key: tokenKey,
      scopes: args.scopes,
      hashedToken,
      user: userID,
    };
    const tokenCreateRes = await new TokenModel(newToken).save();
    return {
      message: `added token with key ${newToken.key}`,
      _id: tokenCreateRes._id,
      data: token,
    };
  }
}

export default AddTokenResolver;
