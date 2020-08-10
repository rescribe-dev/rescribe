import { Resolver, Field, Args, Mutation, Ctx, ArgsType } from 'type-graphql';
import { requirePaymentSystemInitialized } from '../../stripe/init';
import { GraphQLContext } from '../../utils/context';
import { verifyLoggedIn } from '../../auth/checkAuth';
import { AddressModel } from '../../schema/users/address';
import { ObjectId } from 'mongodb';
import { UserModel } from '../../schema/users/user';

@ArgsType()
class DeleteAddressArgs {
  @Field({ description: 'address id' })
  id: ObjectId;
}

@Resolver()
class DeleteAddressResolver {
  @Mutation(_returns => String)
  async deleteAddress(@Args() args: DeleteAddressArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    requirePaymentSystemInitialized();
    if (!verifyLoggedIn(ctx)) {
      throw new Error('user not logged in');
    }
    await AddressModel.deleteOne({
      _id: args.id
    });
    const userID = new ObjectId(ctx.auth?.id);
    const addressData = await UserModel.findOneAndUpdate({
      _id: userID
    }, {
      $pull: {
        addresses: args.id
      }
    });
    if (!addressData) {
      throw new Error(`cannot find address in user ${args.id.toHexString()}`);
    }
    return `deleted address ${addressData.name}`;
  }
}

export default DeleteAddressResolver;
