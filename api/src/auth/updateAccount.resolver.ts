
import { ObjectID } from 'mongodb';
import bcrypt from 'bcrypt';
import { GraphQLContext } from '../utils/context';
import { Resolver, ArgsType, Field, Args, Ctx, Mutation } from 'type-graphql';
import { IsEmail, MinLength, Matches, IsOptional } from 'class-validator';
import { nameMinLen, passwordMinLen, specialCharacterRegex, saltRounds } from './shared';
import { verifyLoggedIn } from './checkAuth';
import { UserModel } from '../schema/user';

@ArgsType()
class UpdateArgs {
  @Field(_type => String, { description: 'name', nullable: true })
  @IsOptional()
  @MinLength(nameMinLen, {
    message: `name must contain at least ${nameMinLen} characters`
  })
  name?: string;

  @Field(_type => String, { description: 'email', nullable: true })
  @IsOptional()
  @IsEmail({}, {
    message: 'invalid email provided'
  })
  email: string;

  @Field(_type => String, { description: 'password', nullable: true })
  @IsOptional()
  @MinLength(passwordMinLen, {
    message: `password must contain at least ${passwordMinLen} characters`
  })
  @Matches(specialCharacterRegex, {
    message: 'no special characters found'
  })
  password: string;
}

interface UserUpdateData {
  name?: string;
  email?: string;
  password?: string;
}

@Resolver()
class RegisterResolver {
  @Mutation(_returns => String)
  async updateAccount(@Args() { name, email, password }: UpdateArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const userUpdateData: UserUpdateData = {};
    if (name) {
      userUpdateData.name = name;
    }
    if (email) {
      userUpdateData.email = email;
    }
    if (password) {
      userUpdateData.password = await bcrypt.hash(password, saltRounds);
    }
    const userID = new ObjectID(ctx.auth?.id);
    await UserModel.updateOne({
      id: userID,
    }, userUpdateData);
    return `updated user ${userID.toHexString()}`;
  }
}

export default RegisterResolver;
