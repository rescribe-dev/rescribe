import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { elasticClient } from '../elastic/init';
import { ObjectId } from 'mongodb';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/auth/user';
import { checkRepositoryAccess } from '../repositories/auth';
import { AccessLevel } from '../schema/auth/access';
import { deleteFileUtil } from '../files/deleteFile.resolver';
import { FileModel } from '../schema/structure/file';
import { RepositoryModel } from '../schema/structure/repository';
import { repositoryIndexName, fileIndexName } from '../elastic/settings';

@ArgsType()
class DeleteBranchArgs {
  @Field(_type => ObjectId, { description: 'repository id' })
  repository: ObjectId;
  @Field(_type => String, { description: 'branch name' })
  name: string;
}

interface FileHit {
  _id: string;
}

export const deleteBranchUtil = async (args: DeleteBranchArgs): Promise<void> => {
  const currentTime = new Date().getTime();
  await elasticClient.update({
    index: repositoryIndexName,
    id: args.repository.toHexString(),
    body: {
      script: {
        source: `
          ctx._source.branches.remove(params.branch);
          ctx._source.updated = params.currentTime;
        `,
        lang: 'painless',
        params: {
          branch: args.name,
          currentTime
        }
      }
    }
  });
  await elasticClient.updateByQuery({
    index: fileIndexName,
    body: {
      script: {
        source: `
          ctx._source.branches.remove(params.branch);
          ctx._source.numBranches--;
          ctx._source.updated = params.currentTime;
        `,
        lang: 'painless',
        params: {
          branch: args.name,
          currentTime
        }
      },
      query: {
        bool: {
          filter: [
            {
              terms: {
                repository: args.repository.toHexString()
              }
            },
            {
              terms: {
                branches: args.name
              }
            }
          ]
        }
      }
    }
  });
  const files = await elasticClient.search({
    index: fileIndexName,
    body: {
      fields: [],
      match: {
        numBranches: 0
      }
    }
  });
  const deleteIDs = (files.body.hits.hits as FileHit[]).map(hit => new ObjectId(hit._id));
  const deleteFilesBody = deleteIDs.flatMap(id => {
    return [{
      delete: {
        _id: id,
        _index: fileIndexName
      }
    }];
  });
  await elasticClient.bulk({ 
    refresh: 'true', 
    body: deleteFilesBody
  });
  await RepositoryModel.updateOne({
    _id: args.repository
  }, {
    $pull: {
      branches: args.name
    }
  });
  for (const fileID of deleteIDs) {
    const file = await FileModel.findById(fileID);
    if (!file) {
      throw new Error(`cannot find file with id ${fileID.toHexString()}`);
    }
    await deleteFileUtil(file, args.name);
  }
};

@Resolver()
class DeleteBranchResolver {
  @Mutation(_returns => String)
  async deleteBranch(@Args() args: DeleteBranchArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const repository = await RepositoryModel.findById(args.repository);
    if (!repository) {
      throw new Error(`cannot find repository with id ${args.repository.toHexString()}`);
    }
    const userID = new ObjectId(ctx.auth.id);
    const user = await UserModel.findById(userID);
    if (!user) {
      throw new Error('cannot find user data');
    }
    if (!(await checkRepositoryAccess(user, repository.project, repository, AccessLevel.edit))) {
      throw new Error('user does not have edit permissions for project or repository');
    }
    if (!repository.branches.includes(args.name)) {
      throw new Error(`cannot find branch with name ${args.name} on repository`);
    }
    await deleteBranchUtil(args);
    return `deleted branch ${args.name}`;
  }
}

export default DeleteBranchResolver;
