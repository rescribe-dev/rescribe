import { ArgsType, Field, Args, Resolver, Query, Ctx } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { verifyAdmin, verifyLoggedIn } from '../../auth/checkAuth';
import Address, { AddressModel } from '../../schema/users/address';
import { requirePaymentSystemInitialized } from '../../stripe/init';
import { GraphQLContext } from '../../utils/context';

@ArgsType()
export class AddressArgs {
  @Field(_type => ObjectId, { description: 'address id' })
  id: ObjectId;
}

@Resolver()
class AddressResolver {
  @Query(_returns => Address)
  async address(@Args() args: AddressArgs, @Ctx() ctx: GraphQLContext): Promise<Address> {
    requirePaymentSystemInitialized();
    if (!verifyLoggedIn(ctx)) {
      throw new Error('user must be logged in');
    }
    const addressData = await AddressModel.findById(args.id);
    if (!addressData) {
      throw new Error(`cannot find address with id ${args.id}`);
    }
    const userID = new ObjectId(ctx.auth?.id);
    if (!addressData.user.equals(userID)) {
      if (!verifyAdmin(ctx)) {
        throw new Error('user not authorized to view given address');
      }
    }
    return addressData;
  }
}

export default AddressResolver;
