import { Resolver, ArgsType, Field, Args, Mutation } from 'type-graphql';
import { logger } from '@typegoose/typegoose/lib/logSettings';
import { elasticClient } from '../elastic/init';
import { ObjectId } from 'mongodb';
import { branchIndexName } from '../elastic/settings';
import { BranchModel } from '../schema/branch';

@ArgsType()
class DeleteBranchArgs {
  @Field(_type => ObjectId, { description: 'branch id' })
  id: ObjectId;
}

@Resolver()
class DeleteBranchResolver {
  @Mutation(_returns => String)
  async deleteBranch(@Args() args: DeleteBranchArgs): Promise<string> {
    const id = new ObjectId();
    const deleteElasticResult = await elasticClient.delete({
      index: branchIndexName,
      id: args.id.toHexString()
    });
    logger.info(`deleted branch ${JSON.stringify(deleteElasticResult.body)}`);
    await BranchModel.deleteOne({
      _id: args.id
    });
    return `deleted branch with id: ${id}`;
  }
}

export default DeleteBranchResolver;
