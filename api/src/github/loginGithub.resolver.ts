import { GraphQLContext } from '../utils/context';
import { Resolver, ArgsType, PubSub, PubSubEngine, Field, Args, Ctx, Mutation } from 'type-graphql';
import { UserModel } from '../schema/users/user';
import { print } from 'graphql/language/printer';
import { gql } from 'apollo-server-express';
import { createGithubOauthClient } from './init';
import { commonLogin } from '../auth/login.resolver';

@ArgsType()
class GithubLoginArgs {
  @Field(_type => String, { description: 'github code' })
  code: string;

  @Field(_type => String, { description: 'gitub state' })
  state: string;
}

interface LoginUserData {
  viewer: {
    email: string;
  }
}

@Resolver()
class LoginGithubResolver {
  @Mutation(_returns => String)
  async loginGithub(@PubSub() pubSub: PubSubEngine, @Args() args: GithubLoginArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    const githubClient = await createGithubOauthClient(args.code, args.state);
    const githubData = await githubClient<LoginUserData>(print(gql`
      query user {
        viewer {
          email
        }
      }
    `));
    const user = await UserModel.findOne({
      email: githubData.viewer.email
    });
    if (!user) {
      throw new Error(`user with email ${githubData.viewer.email} is not signed up`);
    }
    return await commonLogin(user, pubSub, ctx);
  }
}

export default LoginGithubResolver;
