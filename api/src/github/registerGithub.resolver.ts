import { Resolver, ArgsType, Field, Args, Mutation } from 'type-graphql';
import { accountExistsEmail, accountExistsUsername } from '../users/shared';
import { ObjectID } from 'mongodb';
import User, { UserType, UserModel } from '../schema/users/user';
import { createGithubOauthClientREST } from './init';
import { defaultProductName } from '../shared/variables';
import { ApolloError } from 'apollo-server-express';
import statusCodes from 'http-status-codes';
import { addIdenticon } from '../utils/identicon';
import { AccessLevel } from '../schema/users/access';

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

@Resolver()
class RegisterGithubResolver {
  @Mutation(_returns => String)
  async registerGithub(@Args() args: RegisterGithubArgs): Promise<string> {
    const githubRESTClient = await createGithubOauthClientREST(args.code, args.state);

    const githubEmailData = await githubRESTClient('GET /user/emails');
    let email: string | undefined = undefined;
    for (const currentEmailData of githubEmailData.data) {
      if (typeof currentEmailData === 'string') {
        continue;
      }
      if (currentEmailData.primary) {
        email = currentEmailData.email;
      }
    }
    if (!email) {
      throw new ApolloError('cannot find primary email in github', `${statusCodes.NOT_FOUND}`);
    }

    if (await accountExistsEmail(email)) {
      throw new Error(`user with email ${email} already registered`);
    }

    const githubUserData = await githubRESTClient('GET /user');
    const username = args.username ? args.username : githubUserData.data.login;
    if (await accountExistsUsername(username)) {
      throw new Error(`user with username ${username} already exists`);
    }
    let name: string;
    if (args.name) {
      name = args.name;
    } else if (githubUserData.data.name) {
      name = githubUserData.data.name;
    } else {
      name = username;
    }

    const id = new ObjectID();
    const mediaID = await addIdenticon(id, AccessLevel.view);

    const newUser: User = {
      _id: id,
      name,
      username,
      email,
      password: '',
      avatar: mediaID,
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
