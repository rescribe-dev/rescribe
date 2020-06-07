import bcrypt from 'bcrypt';
import { Resolver, ArgsType, Field, Args, Mutation } from 'type-graphql';
import { IsEmail, MinLength, Matches } from 'class-validator';
import { nameMinLen, passwordMinLen, specialCharacterRegex, saltRounds, usernameMinLen } from '../utils/variables';
import { accountExistsEmail, accountExistsUsername } from './shared';
import { ObjectID } from 'mongodb';
import User, { Plan, UserType, UserModel } from '../schema/auth/user';
import { verifyRecaptcha } from '../utils/recaptcha';

@ArgsType()
class RegisterArgs {
  @Field(_type => String, { description: 'recaptcha token' })
  recaptchaToken: string;

  @Field(_type => String, { description: 'name' })
  @MinLength(nameMinLen, {
    message: `name must contain at least ${nameMinLen} characters`
  })
  name: string;

  @Field(_type => String, { description: 'username' })
  @MinLength(usernameMinLen, {
    message: `username must contain at least ${usernameMinLen} characters`
  })
  username: string;

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
class RegisterResolver {
  @Mutation(_returns => String)
  async register(@Args() args: RegisterArgs): Promise<string> {
    if (!(await verifyRecaptcha(args.recaptchaToken))) {
      throw new Error('invalid recaptcha token');
    }
    if (await accountExistsEmail(args.email)) {
      throw new Error('user with email already registered');
    }
    if (await accountExistsUsername(args.username)) {
      throw new Error('user with username already exists');
    }
    const hashedPassword = await bcrypt.hash(args.password, saltRounds);
    const newUser: User = {
      _id: new ObjectID(),
      name: args.name,
      username: args.username,
      email: args.email,
      password: hashedPassword,
      plan: Plan.free,
      type: UserType.user,
      emailVerified: false,
      tokenVersion: 0,
      githubInstallationID: -1,
      githubUsername: '',
      projects: [],
     repositories: []
    };
    const userCreateRes = await new UserModel(newUser).save();
    return (`created user ${userCreateRes.id}`);
  }
}

export default RegisterResolver;
