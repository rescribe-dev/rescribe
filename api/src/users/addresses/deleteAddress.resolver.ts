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

    const addressData = await AddressModel.findById(args.id);
    if (!addressData) {
      throw new Error(`cannot find address with id ${args.id.toHexString()}`);
    }
    const userID = new ObjectId(ctx.auth?.id as string);
    if (!addressData.user.equals(userID)) {
      throw new Error('user not authorized to view address data');
    }
    await AddressModel.deleteOne({
      _id: args.id
    });
    const userData = await UserModel.findById(userID);
    if (!userData) {
      throw new Error('cannot find user data');
    }
    if (userData.defaultAddress && userData.defaultAddress.equals(args.id)) {
      await UserModel.updateOne({
        _id: userID
      }, {
        $set: {
          defaultAddress: undefined
        }
      });
    }
    return `deleted address ${addressData.name}`;
  }
}

export default DeleteAddressResolver;
