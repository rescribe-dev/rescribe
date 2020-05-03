import bcrypt from 'bcrypt';
import { userCollection } from '../db/connect';
import { GraphQLContext } from '../utils/context';
import { verifyGuest } from './checkAuth';
import { generateJWT } from './jwt';
import { Resolver, ArgsType, Field, Query, Args, Ctx, PubSub, PubSubEngine } from 'type-graphql';
import { IsEmail, MinLength, Matches } from "class-validator";
import { authNotificationsTrigger, passwordMinLen, specialCharacterRegex } from './shared';
import { AuthNotificationPayload } from './authNotificationType';

@ArgsType()
class LoginArgs {
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
  @Query(_returns => String)
  async login(@PubSub() pubSub: PubSubEngine, @Args() { email, password }: LoginArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    const user = await userCollection.findOne({
      email
    });
    if (!user) {
      throw new Error(`cannot find user with email ${email}`);
    }
    if (!await bcrypt.compare(password, user.password)) {
      throw new Error('password is invalid');
    }
    const token = await generateJWT(user);
    if (verifyGuest(ctx)) {
      const notification: AuthNotificationPayload = {
        id: ctx.auth?.id as string,
        token
      };
      await pubSub.publish(authNotificationsTrigger, notification);
    }
    return token;
  }

  @Query(_returns => String)
  async loginGuest(): Promise<string> {
    return await generateJWT();
  }
}

export default LoginResolvers;
