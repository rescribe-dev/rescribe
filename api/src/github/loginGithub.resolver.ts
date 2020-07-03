import { GraphQLContext } from '../utils/context';
import { generateJWTAccess, generateJWTRefresh } from '../utils/jwt';
import { Resolver, ArgsType, Field, Args, Ctx, Mutation } from 'type-graphql';
import { setRefreshToken } from '../utils/refreshToken';
import { UserModel } from '../schema/auth/user';
import { print } from 'graphql/language/printer';
import { gql } from 'apollo-server-express';
import { createGithubOauthClient } from './init';

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
  async loginGithub(@Args() args: GithubLoginArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
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
    const token = await generateJWTAccess(user);
    setRefreshToken(ctx.res, await generateJWTRefresh(user));
    return token;
  }
}

export default LoginGithubResolver;
