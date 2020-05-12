import { createClient } from '../utils/github';
import { verifyGithub } from '../auth/checkAuth';
import { GraphQLContext } from '../utils/context';
import { Resolver, ArgsType, Field, Args, Ctx, Mutation } from 'type-graphql';
import { getGithubFile } from '../utils/getGithubFile';
import { UserModel } from '../schema/auth';
import { ObjectId } from 'mongodb';

@ArgsType()
class GithubIndexArgs {
  @Field(_type => [String], { description: 'paths' })
  paths: string[];

  @Field(_type => String, { description: 'branch' })
  ref: string;

  @Field(_type => String, { description: 'repo name' })
  repositoryName: string;

  @Field(_type => String, { description: 'repo owner' })
  repositoryOwner: string;

  @Field(_type => Number, { description: 'github installation id' })
  installationID: number;
}

@Resolver()
class IndexGithubResolver {
  @Mutation(_returns => String)
  async indexGithub(@Args() args: GithubIndexArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (!verifyGithub(ctx) || !ctx.auth) {
      throw new Error('invalid token provided');
    }
    // https://github.com/octokit/graphql.js/
    // https://developer.github.com/v4/explorer/
    // https://github.community/t5/GitHub-API-Development-and/GraphQL-getting-filename-file-content-and-commit-date/td-p/17861
    const user = await UserModel.findById(ctx.auth.id);
    if (!user) {
      throw new Error(`cannot find user ${ctx.auth.id}`);
    }
    if (user.githubUsername.length === 0) {
      UserModel.updateOne({
        _id: new ObjectId(ctx.auth.id)
      }, {
        $set: {
          githubInstallationID: args.installationID,
          githubUsername: args.repositoryOwner
        }
      });
    }
    const githubClient = createClient(args.installationID);
    for (const filePath of args.paths) {
      await getGithubFile(githubClient, args.ref, filePath, args.repositoryName, args.repositoryOwner);
      // TODO - elasticsearch ingestion here
      // indexFile();
    }
    return `successfully processed repo ${args.repositoryName}`;
  }
}

export default IndexGithubResolver;
