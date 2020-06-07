import bcrypt from 'bcrypt';
import { GraphQLContext } from '../utils/context';
import { verifyGuest } from './checkAuth';
import { generateJWTAccess, generateJWTGuest, generateJWTRefresh } from '../utils/jwt';
import { Resolver, ArgsType, Field, Args, Ctx, PubSub, PubSubEngine, Mutation } from 'type-graphql';
import { IsEmail, MinLength, Matches } from 'class-validator';
import { passwordMinLen, specialCharacterRegex } from '../utils/variables';
import { authNotificationsTrigger } from './shared';
import { AuthNotificationPayload } from './authNotificationType';
import User, { UserModel } from '../schema/auth/user';
import { setRefreshToken } from '../utils/refreshToken';
import { verifyRecaptcha } from '../utils/recaptcha';

@ArgsType()
class LoginArgs {
  @Field(_type => String, { description: 'recaptcha token' })
  recaptchaToken: string;

  @Field(_type => String, { description: 'email' })
  @IsEmail({}, {
    message: 'invalid email provided'
  })
  email: string;

  @Field(_type => String, { description: 'password' })
  @MinLength(passwordMinLen, {
    message: `password must contain at least ${passwordMinLen} characters`
  })
  @Matches(specialCharacterRegex, {
    message: 'no special characters found'
  })
  password: string;
}

@Resolver()
class LoginResolvers {
  @Mutation(_returns => String)
  async login(@PubSub() pubSub: PubSubEngine, @Args() args: LoginArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (!(await verifyRecaptcha(args.recaptchaToken))) {
      throw new Error('invalid recaptcha token');
    }
    const userRes = await UserModel.findOne({
      email: args.email
    });
    if (!userRes) {
      throw new Error(`cannot find user with email ${args.email}`);
    }
    const user = userRes as User;
    if (!await bcrypt.compare(args.password, user.password)) {
      throw new Error('password is invalid');
    }
    const token = await generateJWTAccess(user);
    if (verifyGuest(ctx)) {
      const notification: AuthNotificationPayload = {
        id: ctx.auth?.id as string,
        token
      };
      await pubSub.publish(authNotificationsTrigger, notification);
    }
    setRefreshToken(ctx.res, await generateJWTRefresh(user));
    return token;
  }

  @Mutation(_returns => String)
  async loginGuest(): Promise<string> {
    return await generateJWTGuest();
  }
}

export default LoginResolvers;
