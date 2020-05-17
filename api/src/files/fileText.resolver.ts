/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query, Field, Ctx, Int } from 'type-graphql';
import { FileModel, StorageType, FileDB } from '../schema/structure/file';
import { ObjectId } from 'mongodb';
import User, { UserModel } from '../schema/auth/user';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { getGithubFile } from '../utils/getGithubFile';
import { createClient } from '../utils/github';
import { RepositoryModel } from '../schema/structure/repository';
import { BranchModel } from '../schema/structure/branch';
import { checkRepositoryAccess } from '../repositories/auth';
import { AccessLevel } from '../schema/auth/access';
import Location from '../schema/antlr/location';

@ArgsType()
class FileTextArgs {
  @Field(_type => ObjectId, { description: 'file id' })
  id: ObjectId;
  @Field(_type => Int, { description: 'start line' })
  start: number;
  @Field(_type => Int, { description: 'end line' })
  end: number;
}

const getLines = (content: string, start: number, end: number): string => {
  let lineCount = 0;
  let startIndex = -1;
  let endIndex = -1;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '\n') {
      lineCount++;
    }
    if (lineCount === start) {
      startIndex = i;
    }
    if (lineCount === end) {
      endIndex = i;
      break;
    }
  }
  if (startIndex < 0) {
    return '';
  }
  if (endIndex < 0) {
    endIndex = content.length - 1;
  }
  return content.substring(startIndex, endIndex + 1);
};

export const getText = async (file: FileDB, user: User, args: Location): Promise<string> => {
  if (file.content.length > 0) {
    return getLines(file.content, args.start, args.end);
  } else if (file.location === StorageType.github) {
    if (user.githubUsername.length === 0) {
      throw new Error('did not install github app');
    }
    // get from github
    const repository = await RepositoryModel.findOne({
      _id: file.repository
    });
    if (!repository) {
      throw new Error('cannot find repository');
    }
    const branch = await BranchModel.findOne({
      _id: file.branch
    });
    if (!branch) {
      throw new Error('cannot find branch');
    }
    const githubClient = createClient(user.githubInstallationID);
    const content = await getGithubFile(githubClient, branch.name, file.path, repository.name, user.githubUsername);
    return getLines(content, args.start, args.end);
  } else if (file.location === StorageType.local) {
    throw new Error('content not stored in cloud');
  } else {
    throw new Error('invalid storage location');
  }
};

@Resolver()
class FileText {
  @Query(_returns => String)
  async fileText(@Args() args: FileTextArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const file = await FileModel.findById(args.id);
    if (!file) {
      throw new Error(`cannot find file ${args.id.toHexString()}`);
    }
    const user = await UserModel.findById(ctx.auth.id);
    if (!user) {
      throw new Error(`user ${args.id.toHexString()} cannot be found`);
    }
    if (!checkRepositoryAccess(user, file.project, file.repository, AccessLevel.view)) {
      throw new Error('user not authorized to view file');
    }
    return await getText(file, user, args);
  }
}

export default FileText;
