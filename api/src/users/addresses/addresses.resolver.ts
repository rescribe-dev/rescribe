import { ArgsType, Field, Args, Resolver, Query, Ctx } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { verifyAdmin, verifyLoggedIn } from '../../auth/checkAuth';
import Address, { AddressModel } from '../../schema/users/address';
import { requirePaymentSystemInitialized } from '../../stripe/init';
import { GraphQLContext } from '../../utils/context';

@ArgsType()
export class AddressesArgs {
  @Field(_type => ObjectId, { description: 'address user', nullable: true })
  user?: ObjectId;
}

@Resolver()
class AddressesResolver {
  @Query(_returns => [Address])
  async addresses(@Args() args: AddressesArgs, @Ctx() ctx: GraphQLContext): Promise<Address[]> {
    requirePaymentSystemInitialized();
    if (!verifyLoggedIn(ctx)) {
      throw new Error('user must be logged in');
    }
    let userID: ObjectId = new ObjectId(ctx.auth?.id);
    if (args.user) {
      if (!args.user.equals(userID) && !verifyAdmin(ctx)) {
        throw new Error('only admins can view addresses for specific users');
      }
      userID = args.user;
    }
    const addressData = await AddressModel.find({
      user: userID
    });
    return addressData;
  }
}

export default AddressesResolver;
