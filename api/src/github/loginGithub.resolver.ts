import { GraphQLContext } from '../utils/context';
import { Resolver, ArgsType, PubSub, PubSubEngine, Field, Args, Ctx, Mutation } from 'type-graphql';
import { UserModel } from '../schema/users/user';
import { ApolloError } from 'apollo-server-express';
import { createGithubOauthClientREST } from './init';
import { commonLogin } from '../auth/login.resolver';
import { NOT_FOUND } from 'http-status-codes';

@ArgsType()
class GithubLoginArgs {
  @Field(_type => String, { description: 'github code' })
  code: string;

  @Field(_type => String, { description: 'gitub state' })
  state: string;
}

@Resolver()
class LoginGithubResolver {
  @Mutation(_returns => String)
  async loginGithub(@PubSub() pubSub: PubSubEngine, @Args() args: GithubLoginArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    const githubRESTClient = await createGithubOauthClientREST(args.code, args.state);

    const githubEmailData = await githubRESTClient('GET /user/emails');
    let email: string | undefined = undefined;
    for (const currentEmailData of githubEmailData.data) {
      if (currentEmailData.primary) {
        email = currentEmailData.email;
      }
    }
    if (!email) {
      throw new ApolloError('cannot find primary email in github', `${NOT_FOUND}`);
    }

    const user = await UserModel.findOne({
      email
    });
    if (!user) {
      throw new Error(`user with email ${email} is not signed up`);
    }
    return await commonLogin(user, pubSub, ctx);
  }
}

export default LoginGithubResolver;
