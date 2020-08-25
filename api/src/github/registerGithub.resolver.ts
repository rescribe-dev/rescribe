import { Resolver, ArgsType, Field, Args, Mutation } from 'type-graphql';
import { accountExistsEmail, accountExistsUsername } from '../users/shared';
import { ObjectID } from 'mongodb';
import User, { UserType, UserModel } from '../schema/users/user';
import { createGithubOauthClient } from './init';
import { gql } from 'apollo-server-express';
import { print } from 'graphql/language/printer';
import { defaultProductName } from '../shared/variables';

@ArgsType()
class RegisterGithubArgs {
  @Field(_type => String, { description: 'name', nullable: true })
  name?: string;

  @Field(_type => String, { description: 'username', nullable: true })
  username?: string;

  @Field(_type => String, { description: 'github code' })
  code: string;

  @Field(_type => String, { description: 'gitub state' })
  state: string;
}

interface RegisterUserData {
  viewer: {
    login: string;
    email: string;
    name: string;
  }
}

@Resolver()
class RegisterGithubResolver {
  @Mutation(_returns => String)
  async registerGithub(@Args() args: RegisterGithubArgs): Promise<string> {
    const githubClient = await createGithubOauthClient(args.code, args.state);
    const githubData = await githubClient<RegisterUserData>(print(gql`
      query user {
        viewer {
          login
          name
          email
        }
      }
    `));
    const email = githubData.viewer.email;
    if (await accountExistsEmail(email)) {
      throw new Error(`user with email ${email} already registered`);
    }
    const username = args.username ? args.username : githubData.viewer.login;
    if (await accountExistsUsername(username)) {
      throw new Error(`user with username ${username} already exists`);
    }
    const name = args.name ? args.name : githubData.viewer.name;
    const newUser: User = {
      _id: new ObjectID(),
      name,
      username,
      email,
      password: '',
      plan: defaultProductName,
      subscriptionID: '',
      type: UserType.user,
      emailVerified: true,
      tokenVersion: 0,
      githubInstallationID: -1,
      githubUsername: username,
      projects: [],
      repositories: []
    };
    const userCreateRes = await new UserModel(newUser).save();
    return `created user ${userCreateRes.id}`;
  }
}

export default RegisterGithubResolver;
