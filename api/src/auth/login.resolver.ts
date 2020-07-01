import bcrypt from 'bcrypt';
import { GraphQLContext } from '../utils/context';
import { verifyGuest } from './checkAuth';
import { generateJWTAccess, generateJWTGuest, generateJWTRefresh } from '../utils/jwt';
import { Resolver, ArgsType, Field, Args, Ctx, PubSub, PubSubEngine, Mutation } from 'type-graphql';
import { MinLength, Matches } from 'class-validator';
import { passwordMinLen, specialCharacterRegex, numberRegex, capitalLetterRegex, lowercaseLetterRegex } from '../utils/variables';
import { authNotificationsTrigger } from './shared';
import { AuthNotificationPayload } from './authNotificationType';
import User, { UserModel } from '../schema/auth/user';
import { setRefreshToken } from '../utils/refreshToken';
import { verifyRecaptcha } from '../utils/recaptcha';

@ArgsType()
class LoginArgs {
  @Field(_type => String, { description: 'recaptcha token' })
  recaptchaToken: string;

  @Field(_type => String, { description: 'username or email' })
  usernameEmail: string;

  @Field(_type => String, { description: 'password' })
  @MinLength(passwordMinLen, {
    message: `password must contain at least ${passwordMinLen} characters`
  })
  @Matches(lowercaseLetterRegex, {
    message: 'no lowercase letter found'
  })
  @Matches(capitalLetterRegex, {
    message: 'no capital letter found'
  })
  @Matches(numberRegex, {
    message: 'no number found'
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
    let user: User;
    if (args.usernameEmail.includes('@')) {
      const userRes = await UserModel.findOne({
        email: args.usernameEmail
      });
      if (!userRes) {
        throw new Error(`cannot find user with email ${args.usernameEmail}`);
      }
      user = userRes as User;
    } else {
      const userRes = await UserModel.findOne({
        username: args.usernameEmail
      });
      if (!userRes) {
        throw new Error(`cannot find user with username ${args.usernameEmail}`);
      }
      user = userRes as User;
    }
    if (!user.emailVerified) {
      throw new Error('email is not verified');
    }
    if (!await bcrypt.compare(args.password, user.password)) {
      throw new Error('password is invalid');
    }
    const token = await generateJWTAccess(user);
    if (verifyGuest(ctx) && ctx.auth !== undefined) {
      const notification: AuthNotificationPayload = {
        id: ctx.auth.id,
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
