import bcrypt from 'bcrypt';
import { userCollection } from "../db/connect";
import { Resolver, ArgsType, Field, Args, Mutation } from 'type-graphql';
import { IsEmail, MinLength, Matches } from "class-validator";
import { nameMinLen, passwordMinLen, specialCharacterRegex, accountExists, saltRounds } from './shared';
import { ObjectID } from 'mongodb';
import User, { Plan, UserType } from '../schema/auth';

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
      id: new ObjectID(),
      name: name,
      email: email,
      password: hashedPassword,
      plan: Plan.free,
      type: UserType.user,
      emailVerified: false
    };
    const userCreateRes = await userCollection.insertOne(newUser);
    return (`created user ${userCreateRes.insertedId}`);
  }
}

export default RegisterResolver;
