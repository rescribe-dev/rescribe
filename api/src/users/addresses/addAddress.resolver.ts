import { Resolver, Field, Args, Mutation, Ctx, ArgsType } from 'type-graphql';
import { requirePaymentSystemInitialized } from '../../stripe/init';
import { GraphQLContext } from '../../utils/context';
import { verifyLoggedIn } from '../../auth/checkAuth';
import Address, { AddressModel } from '../../schema/users/address';
import { ObjectId } from 'mongodb';
import { UserModel } from '../../schema/users/user';

@ArgsType()
class AddAddressArgs {
  @Field({ description: 'name' })
  name: string;

  @Field({ description: 'line 1' })
  line1: string;

  @Field({ description: 'line 2', nullable: true })
  line2?: string;

  @Field({ description: 'city' })
  city: string;

  @Field({ description: 'state' })
  state: string;

  @Field({ description: 'postal code' })
  postal_code: string;

  @Field({ description: 'country' })
  country: string;
}

@Resolver()
class AddAddressResolver {
  @Mutation(_returns => String)
  async addAddress(@Args() args: AddAddressArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    requirePaymentSystemInitialized();
    if (!verifyLoggedIn(ctx)) {
      throw new Error('user not logged in');
    }
    const userID = new ObjectId(ctx.auth?.id);
    const addressID = new ObjectId();
    const newAddress: Address = {
      _id: addressID,
      user: userID,
      ...args
    };
    await new AddressModel(newAddress).save();
    await UserModel.updateOne({
      _id: userID
    }, {
      $addToSet: {
        addresses: addressID
      }
    });
    return `added address ${newAddress.name}`;
  }
}

export default AddAddressResolver;
