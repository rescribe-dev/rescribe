
import { ObjectId } from 'mongodb';
import { GraphQLContext } from '../utils/context';
import { Resolver, ArgsType, Field, Args, Ctx, Mutation } from 'type-graphql';
import { IsOptional } from 'class-validator';
import { verifyLoggedIn, verifyAdmin } from '../auth/checkAuth';
import { UserModel } from '../schema/users/user';
import { ApolloError } from 'apollo-server-express';
import { NOT_FOUND } from 'http-status-codes';
import { AccessLevel } from '../schema/users/access';
import { deleteProjectUtil } from '../projects/deleteProject.resolver';
import { deleteRepositoryUtil } from '../repositories/deleteRepository.resolver';
import { PaymentMethodModel } from '../schema/users/paymentMethod';
import { deletePaymentMethodUtil } from './paymentMethods/deletePaymentMethod.resolver';
import { AddressModel } from '../schema/users/address';

@ArgsType()
class DeleteArgs {
  @Field(_type => String, { description: 'id', nullable: true })
  @IsOptional()
  id?: ObjectId;
}

@Resolver()
class UpdateAccountResolver {
  @Mutation(_returns => String)
  async updateAccount(@Args() args: DeleteArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const authID = new ObjectId(ctx.auth.id);
    if (args.id) {
      if (!verifyAdmin(ctx) && !authID.equals(args.id)) {
        throw new Error('only admins can delete specific users');
      }
    } else {
      args.id = authID;
    }
    const userData = await UserModel.findById(args.id);
    if (!userData) {
      throw new ApolloError('cannot find user data', `${NOT_FOUND}`);
    }
    for (const projectAccess of userData.projects) {
      if (projectAccess.level === AccessLevel.owner) {
        await deleteProjectUtil({
          id: projectAccess._id
        }, args.id);
      }
    }
    for (const repositoryAccess of userData.repositories) {
      if (repositoryAccess.level === AccessLevel.owner) {
        await deleteRepositoryUtil({
          id: repositoryAccess._id
        }, args.id);
      }
    }
    const paymentMethods = await PaymentMethodModel.find({
      user: args.id
    });
    for (const paymentMethod of paymentMethods) {
      await deletePaymentMethodUtil(paymentMethod);
    }
    await AddressModel.deleteMany({
      user: args.id
    });
    await UserModel.deleteOne({
      _id: args.id
    });
    return `deleted user ${args.id.toHexString()}`;
  }
}

export default UpdateAccountResolver;
