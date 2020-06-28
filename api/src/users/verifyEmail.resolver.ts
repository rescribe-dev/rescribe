import { Resolver, ArgsType, Field, Args, Mutation } from 'type-graphql';
import { MinLength } from 'class-validator';
import { minJWTLen } from '../utils/variables';
import { UserModel } from '../schema/auth/user';
import { decodeVerify } from '../utils/jwt';

@ArgsType()
class VerifyEmailArgs {
  @Field(_type => String, { description: 'name' })
  @MinLength(minJWTLen, {
    message: `jwt must contain at least ${minJWTLen} characters`
  })
  token: string;
}

@Resolver()
class VerifyEmailResolver {
  @Mutation(_returns => String)
  async verifyEmail(@Args() args: VerifyEmailArgs): Promise<string> {
    const userData = await decodeVerify(args.token);
    const user = await UserModel.findById(userData.id);
    if (!user) {
      throw new Error('cannot find user with given id');
    }
    if (user.emailVerified) {
      throw new Error('email already verified');
    }
    await UserModel.updateOne({
      _id: user._id
    }, {
      $set: {
        emailVerified: true
      }
    });
    return (`verified email ${user.email}`);
  }
}

export default VerifyEmailResolver;
