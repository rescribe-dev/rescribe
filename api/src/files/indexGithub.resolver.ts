import { gql } from 'apollo-server-express';
import { getLogger } from 'log4js';
import { createClient } from '../utils/github';
import { print } from 'graphql/language/printer';
import { verifyGithub } from '../auth/checkAuth';
import { GraphQLContext } from '../utils/context';
import { Resolver, ArgsType, Field, Args, Ctx, Mutation } from 'type-graphql';

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

const logger = getLogger();

interface GithubFileRes {
  isBinary: boolean;
  text: string;
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
    const githubClient = createClient(args.installationID);
    for (const filePath of args.paths) {
      const expression = `${args.ref}:${filePath}`;
      const res = await githubClient(print(gql`
        query files($name: String!, $owner: String!, $expression: String!) { 
          repository(name: $name, owner: $owner) { 
            object(expression: $expression) {
              ...on Blob {
                isBinary
                text
              }
            }
          }
        }
      `), {
        expression,
        name: args.repositoryName,
        owner: args.repositoryOwner
      });
      if (!res) {
        throw new Error(`no response found for file query ${expression}`);
      }
      const fileData = res.repository.object as GithubFileRes;
      // logger.info(res);
      if (fileData.isBinary) {
        logger.info(`file ${expression} is binary`);
      } else {
        logger.info(`file contents: "${fileData.text}"`);
        // TODO - elasticsearch ingestion here
        // indexFile();
      }
    }
    return `successfully processed repo ${args.repositoryName}`;
  }
}

export default IndexGithubResolver;
