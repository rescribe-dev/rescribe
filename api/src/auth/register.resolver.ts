import bcrypt from 'bcrypt';
import { Resolver, ArgsType, Field, Args, Mutation } from 'type-graphql';
import { IsEmail, MinLength, Matches } from 'class-validator';
import { nameMinLen, passwordMinLen, specialCharacterRegex, accountExists, saltRounds } from './shared';
import { ObjectID } from 'mongodb';
import User, { Plan, UserType, UserModel } from '../schema/user';

@ArgsType()
class RegisterArgs {
  @Field(_type => String, { description: 'name' })
  @MinLength(nameMinLen, {
    message: `name must contain at least ${nameMinLen} characters`
  })
  name: string;

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
  async register(@Args() { name, email, password }: RegisterArgs): Promise<string> {
    if (await accountExists(email)) {
      throw new Error('user with email already registered');
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser: User = {
      _id: new ObjectID(),
      name: name,
      email: email,
      password: hashedPassword,
      plan: Plan.free,
      type: UserType.user,
      emailVerified: false,
      tokenVersion: 0,
      githubInstallationID: -1,
      githubUsername: ''
    };
    const userCreateRes = await new UserModel(newUser).save();
    return (`created user ${userCreateRes.id}`);
  }
}

export default RegisterResolver;
