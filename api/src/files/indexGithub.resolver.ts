import { createClient } from '../utils/github';
import { verifyGithub } from '../auth/checkAuth';
import { GraphQLContext } from '../utils/context';
import yaml from 'js-yaml';
import { Resolver, ArgsType, Field, Args, Ctx, Mutation } from 'type-graphql';
import { getGithubFile } from '../utils/getGithubFile';
import { UserModel } from '../schema/user';
import { indexFile } from './shared';
import { StorageType } from '../schema/file';
import { RepositoryModel } from '../schema/repository';
import { BranchModel } from '../schema/branch';
import { graphql } from '@octokit/graphql/dist-types/types';
import { ObjectId } from 'mongodb';
import { addBranchUtil } from '../branches/addBranch.resolver';

export const githubConfigFilePath = 'rescribe.yml';

@ArgsType()
class GithubIndexArgs {//https://developer.github.com/apps/building-github-apps/authenticating-with-github-apps/#authenticating-as-an-installation
  //https://developer.github.com/v3/apps/#create-a-new-installation-token
  @Field({ description: 'github repository id' })
  githubRepositoryID: number;  

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

const getFileName = (path: string): string => {
  return path.substring(path.lastIndexOf('/') + 1);
};

interface GithubConfiguration {
  repositoryID: string;
  projectID: string;
}

let githubConfig: GithubConfiguration | undefined = undefined;

const getConfigurationData = async (githubClient: graphql, args: GithubIndexArgs): Promise<void> => {
  const content = await getGithubFile(githubClient, args.ref, githubConfigFilePath, args.repositoryName, args.repositoryOwner);
  githubConfig = yaml.safeLoad(content);
  if (!githubConfig) {
    throw new Error('valid configuration file not found');
  }
};

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
    const user = await UserModel.findOne({
      githubUsername: args.repositoryOwner
    });
    if (!user) {
      throw new Error('Cannot find the associated account');
    }
    if (user.githubUsername.length === 0) {
      UserModel.updateOne({
        _id: user._id
      }, {
        $set: {
          githubInstallationID: args.installationID,
          githubUsername: args.repositoryOwner
        }
      });
    }
    const githubClient = createClient(args.installationID);
    const repository = await RepositoryModel.findOne({
      githubID: args.githubRepositoryID,
    });
    let repositoryID: ObjectId;
    let projectID: ObjectId;
    // if repository or project does not exist create using client
    if (!repository) {
      try {
        getConfigurationData(githubClient, args);
        repositoryID = new ObjectId(githubConfig?.repositoryID);
        projectID = new ObjectId(githubConfig?.projectID);
      } catch(err) {
        throw new Error('project & repo not found');
      }
    } else {
      repositoryID = repository._id;
      projectID = repository.project;
    }
    const branch = await BranchModel.findOne({
      name: args.ref,
      repository: repositoryID
    });
    let branchID: ObjectId;
    if (!branch) {
      // create branch here
      branchID = await addBranchUtil({
        name: args.ref,
        repository: repositoryID
      });
    } else {
      branchID = branch._id;
    }
    // as a stopgap use the configuration file to check for this stuff
    for (const filePath of args.paths) {
      const content = await getGithubFile(githubClient, args.ref, filePath, args.repositoryName, args.repositoryOwner);
      await indexFile(false, StorageType.github, projectID, repositoryID, branchID, filePath, getFileName(filePath), content);
    }
    return `successfully processed repo ${args.repositoryName}`;
  }
}

export default IndexGithubResolver;
