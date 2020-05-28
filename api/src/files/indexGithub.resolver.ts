import { createClient } from '../utils/github';
import { verifyGithub } from '../auth/checkAuth';
import { GraphQLContext } from '../utils/context';
import yaml from 'js-yaml';
import { Resolver, ArgsType, Field, Args, Ctx, Mutation, Int } from 'type-graphql';
import { getGithubFile } from '../utils/getGithubFile';
import { UserModel } from '../schema/auth/user';
import { indexFile, UpdateType } from './shared';
import { StorageType, FileModel } from '../schema/structure/file';
import { RepositoryModel } from '../schema/structure/repository';
import { graphql } from '@octokit/graphql/dist-types/types';
import { ObjectId } from 'mongodb';
import { addBranchUtil } from '../branches/addBranch.resolver';
import checkFileExtension from '../utils/checkFileExtension';
import { deleteFileUtil } from './deleteFile.resolver';
import { AccessLevel } from '../schema/auth/access';
import { ProjectModel } from '../schema/structure/project';

export const githubConfigFilePath = 'rescribe.yml';

//https://developer.github.com/apps/building-github-apps/authenticating-with-github-apps/#authenticating-as-an-installation
//https://developer.github.com/v3/apps/#create-a-new-installation-token

@ArgsType()
class GithubIndexArgs {
  @Field(_type => Int, { description: 'github repository id' })
  githubRepositoryID: number;

  @Field(_type => [String], { description: 'added' })
  added: string[];

  @Field(_type => [String], { description: 'modified' })
  modified: string[];

  @Field(_type => [String], { description: 'removed' })
  removed: string[];

  @Field(_type => String, { description: 'branch' })
  ref: string;

  @Field(_type => String, { description: 'repo name' })
  repositoryName: string;

  @Field(_type => String, { description: 'repo owner' })
  repositoryOwner: string;

  @Field(_type => Int, { description: 'github installation id' })
  installationID: number;
}

const getFileName = (path: string): string => {
  return path.substring(path.lastIndexOf('/') + 1);
};

interface GithubConfiguration {
  repository: string;
  project: string;
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
    if (user.githubInstallationID < 0) {
      await UserModel.updateOne({
        _id: user._id
      }, {
        $set: {
          githubInstallationID: args.installationID
        }
      });
    }
    const githubClient = createClient(args.installationID);
    let repository = await RepositoryModel.findOne({
      githubID: args.githubRepositoryID,
    });
    let repositoryID: ObjectId;
    let projectID: ObjectId;
    // if repository or project does not exist create using client
    if (!repository) {
      try {
        await getConfigurationData(githubClient, args);
        repositoryID = new ObjectId(githubConfig?.repository);
        repository = await RepositoryModel.findById(repositoryID);
        if (!repository) {
          throw new Error(`cannot find repository with id ${repositoryID.toHexString()}`);
        }
        projectID = new ObjectId(githubConfig?.project);
        if (!(await ProjectModel.findById(projectID))) {
          throw new Error(`cannot find project with id ${projectID.toHexString()}`);
        }
      } catch (err) {
        throw new Error('project & repo not found');
      }
    } else {
      repositoryID = repository._id;
      projectID = repository.project;
    }
    const branch = args.ref;
    if (!repository.branches.includes(branch)) {
      // create branch here
      await addBranchUtil({
        name: branch,
        repository: repositoryID
      });
    }
    // as a stopgap use the configuration file to check for this stuff
    for (const filePath of args.added) {
      if (!checkFileExtension(filePath)) {
        continue;
      }
      const content = await getGithubFile(githubClient, args.ref, filePath, args.repositoryName, args.repositoryOwner);
      await indexFile({
        saveContent: false,
        action: UpdateType.add,
        file: undefined,
        location: StorageType.github,
        project: projectID,
        repository: repositoryID,
        branch,
        path: filePath,
        fileName: getFileName(filePath),
        public: repository?.public as AccessLevel,
        content
      });
    }
    for (const filePath of args.modified) {
      if (!checkFileExtension(filePath)) {
        continue;
      }
      const file = await FileModel.findOne({
        path: filePath,
        branch,
        repository: repositoryID
      });
      if (!file) {
        continue;
      }
      const content = await getGithubFile(githubClient, args.ref, filePath, args.repositoryName, args.repositoryOwner);
      await indexFile({
        saveContent: false,
        action: UpdateType.update,
        file,
        location: StorageType.github,
        project: projectID,
        repository: repositoryID,
        branch,
        path: filePath,
        fileName: getFileName(filePath),
        public: repository?.public as AccessLevel,
        content
      });
    }
    // TODO - bulk request to find and delete files with no branches anymore
    for (const filePath of args.removed) {
      if (!checkFileExtension(filePath)) {
        continue;
      }
      const file = await FileModel.findOne({
        path: filePath,
        branch,
        repository: repositoryID
      });
      if (!file) {
        continue;
      }
      await deleteFileUtil(file);
    }
    return `successfully processed repo ${args.repositoryName}`;
  }
}

export default IndexGithubResolver;
