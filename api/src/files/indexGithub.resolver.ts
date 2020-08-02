import { createGithubAppClient } from '../github/init';
import { verifyGithub } from '../auth/checkAuth';
import { GraphQLContext } from '../utils/context';
import yaml from 'js-yaml';
import { Resolver, ArgsType, Field, Args, Ctx, Mutation, Int } from 'type-graphql';
import { getGithubFile } from '../github/getGithubFile';
import { UserModel } from '../schema/auth/user';
import { indexFile, saveChanges, FileWriteData, Aggregates } from './shared';
import { RepositoryModel } from '../schema/structure/repository';
import { graphql } from '@octokit/graphql/dist-types/types';
import { ObjectId } from 'mongodb';
import { addBranchUtil } from '../branches/addBranch.resolver';
import { SaveElasticElement } from '../elastic/elastic';
import { WriteMongoElement } from '../db/mongo';
import { deleteFilesUtil, saveAggregates } from './deleteFiles.resolver';
import { getFilePath } from '../shared/files';
import { WriteType } from '../utils/writeType';

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
}

let githubConfig: GithubConfiguration | undefined = undefined;

const getConfigurationData = async (githubClient: graphql, args: GithubIndexArgs): Promise<void> => {
  const content = await getGithubFile(githubClient, args.ref, githubConfigFilePath, args.repositoryName, args.repositoryOwner);
  if (content.isBinary) {
    throw new Error('configuration file is binary');
  }
  githubConfig = yaml.safeLoad(content.text) as GithubConfiguration | undefined;
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
    const githubClient = await createGithubAppClient(args.installationID);
    let repository = await RepositoryModel.findOne({
      githubID: args.githubRepositoryID
    });
    let repositoryID: ObjectId;
    // if repository or project does not exist create using client
    if (!repository) {
      try {
        await getConfigurationData(githubClient, args);
      } catch (err) {
        throw new Error('project & repo configuration data not found');
      }
      repositoryID = new ObjectId(githubConfig?.repository);
      repository = await RepositoryModel.findById(repositoryID);
      if (!repository) {
        throw new Error(`cannot find repository with id ${repositoryID.toHexString()}`);
      }
    } else {
      repositoryID = repository._id;
    }
    if (!repository) return 'repository invalid';
    const branch = args.ref;
    if (!repository.branches.includes(branch)) {
      // create branch here
      await addBranchUtil({
        name: branch,
        repository: repositoryID
      });
    }
    const fileElasticWrites: SaveElasticElement[] = [];
    const fileMongoWrites: WriteMongoElement[] = [];
    const fileWrites: FileWriteData[] = [];
    const aggregates: Aggregates = {
      linesOfCode: repository.linesOfCode,
      numberOfFiles: repository.numberOfFiles
    };
    // as a stopgap use the configuration file to check for this stuff
    for (const filePath of args.added) {
      const content = await getGithubFile(githubClient, args.ref, filePath, args.repositoryName, args.repositoryOwner);
      await indexFile({
        action: WriteType.add,
        repository: repositoryID,
        branch,
        path: getFilePath(filePath).path,
        fileName: getFileName(filePath),
        public: repository.public,
        content: content.text,
        isBinary: content.isBinary,
        fileElasticWrites,
        fileMongoWrites,
        fileWrites,
        aggregates
      });
    }
    for (const filePath of args.modified) {
      const content = await getGithubFile(githubClient, args.ref, filePath, args.repositoryName, args.repositoryOwner);
      await indexFile({
        action: WriteType.update,
        repository: repositoryID,
        branch,
        path: filePath,
        fileName: getFileName(filePath),
        public: repository.public,
        content: content.text,
        isBinary: content.isBinary,
        fileElasticWrites,
        fileMongoWrites,
        fileWrites,
        aggregates
      });
    }
    const deletePaths: string[] = [];
    for (const filePath of args.removed) {
      deletePaths.push(filePath);
    }
    await deleteFilesUtil({
      repository: repositoryID,
      branch,
      files: deletePaths,
      aggregates,
      bulkUpdateFileElasticData: fileElasticWrites,
      bulkUpdateFileMongoData: fileMongoWrites,
      bulkUpdateFileWrites: fileWrites
    });
    await saveChanges({
      branch,
      repositoryID,
      fileElasticWrites,
      fileMongoWrites,
      fileWrites
    });
    await saveAggregates(aggregates, repository._id);
    return `successfully processed repo ${args.repositoryName}`;
  }
}

export default IndexGithubResolver;
