import { Resolver, Field, Args, Mutation, Ctx, ArgsType } from 'type-graphql';
import { GraphQLContext } from '../../utils/context';
import { verifyLoggedIn } from '../../auth/checkAuth';
import { ObjectId } from 'mongodb';
import { TokenModel } from '../../schema/users/token';

@ArgsType()
class DeleteTokenArgs {
  @Field({ description: 'token id' })
  id: ObjectId;
}

@Resolver()
class DeleteTokenResolver {
  @Mutation(_returns => String)
  async deleteToken(@Args() args: DeleteTokenArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }

    const tokenData = await TokenModel.findById(args.id);
    if (!tokenData) {
      throw new Error(`cannot find token with id ${args.id.toHexString()}`);
    }
    const userID = new ObjectId(ctx.auth.id);
    if (!tokenData.user.equals(userID)) {
      throw new Error('user not authorized to delete the token');
    }
    await TokenModel.deleteOne({
      _id: args.id
    });
    return `deleted token ${tokenData.key}`;
  }
}

export default DeleteTokenResolver;
