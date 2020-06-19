/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query, Field, Ctx, Int } from 'type-graphql';
import { FileModel, FileDB } from '../schema/structure/file';
import { ObjectId } from 'mongodb';
import { UserModel } from '../schema/auth/user';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { checkRepositoryAccess } from '../repositories/auth';
import { AccessLevel } from '../schema/auth/access';
import Location from '../schema/antlr/location';
import { getS3FileData, getFileKey } from '../utils/aws';
import { cache } from '../utils/redis';
import { configData } from '../utils/config';

const redisExpireSeconds = 60 * 20;

@ArgsType()
class FileTextArgs {
  @Field(_type => ObjectId, { description: 'file id' })
  id: ObjectId;
  @Field({ description: 'branch name' })
  branch: string;
  @Field(_type => Int, { description: 'start line' })
  start: number;
  @Field(_type => Int, { description: 'end line' })
  end: number;
}

export const getLinesArray = (content: string[], location: Location, trim: boolean, maxLineLength?: number): string[] => {
  if (location.end < location.start) {
    return [];
  }
  const slicedContent = content.slice(location.start - 1, location.end);
  const reducedContent = maxLineLength ? slicedContent.map(line => line.substring(0, maxLineLength)) : slicedContent;
  return trim ? reducedContent.map(line => line.trimRight()) : reducedContent;
};

export const getLines = (content: string, location: Location): string[] => {
  let lineCount = 1;
  let startIndex = -1;
  let endIndex = -1;
  if (lineCount === location.start) {
    startIndex = 0;
  }
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '\n') {
      lineCount++;
      if (lineCount === location.start) {
        startIndex = i + 1;
      }
      if (lineCount === location.end + 1) {
        endIndex = i - 1;
        break;
      }
    }
  }
  if (startIndex < 0) {
    return [];
  }
  if (endIndex < 0) {
    endIndex = content.length - 1;
  }
  return content.substring(startIndex, endIndex + 1).split('\n');
};

interface RedisKey {
  fileKey: string;
}

export const getText = async (file: FileDB, branch: string, args: Location): Promise<string[]> => {
  const fileKey = getFileKey(file.repository, branch, file.path);
  const redisKeyObject: RedisKey = {
    fileKey
  };
  const redisKey = JSON.stringify(redisKeyObject);
  const redisData = await cache.get(redisKey);
  if (redisData && !configData.DISABLE_CACHE) {
    return getLines(redisData, args);
  }
  const content = await getS3FileData(fileKey);
  await cache.set(redisKey, content, 'ex', redisExpireSeconds);
  return getLines(content, args);
};

@Resolver()
class FileText {
  @Query(_returns => [String])
  async fileText(@Args() args: FileTextArgs, @Ctx() ctx: GraphQLContext): Promise<string[]> {
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
    if (!(await checkRepositoryAccess(user, file.project, file.repository, AccessLevel.view))) {
      throw new Error('user not authorized to view file');
    }
    if (!file.branches.includes(args.branch)) {
      throw new Error(`branch ${args.branch} not found for file ${args.id.toHexString()}`);
    }
    return await getText(file, args.branch, args);
  }
}

export default FileText;
