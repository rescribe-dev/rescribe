import { Resolver, ArgsType, Args, Query, Field, Ctx, Int } from 'type-graphql';
import { elasticClient } from '../elastic/init';
import { repositoryIndexName } from '../elastic/settings';
import { ObjectId } from 'mongodb';
import { Repository } from '../schema/structure/repository';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/users/user';
import { AccessLevel } from '../schema/users/access';
import { GraphQLContext } from '../utils/context';
import { checkProjectAccess } from '../projects/auth';
import { Min, Max } from 'class-validator';
import { checkPaginationArgs } from '../elastic/pagination';
import { ProjectModel } from '../schema/structure/project';
import esb from 'elastic-builder';

const maxPerPage = 20;

@ArgsType()
class RepositoriesArgs {
  @Field(_type => [ObjectId], { description: 'project id', nullable: true })
  projects?: ObjectId[];

  @Min(0, {
    message: 'page number must be greater than or equal to 0'
  })
  @Field(_type => Int, { description: 'page number', nullable: true })
  page?: number;

  @Min(1, {
    message: 'per page must be greater than or equal to 1'
  })
  @Max(maxPerPage, {
    message: `per page must be less than or equal to ${maxPerPage}`
  })
  @Field(_type => Int, { description: 'number per page', nullable: true })
  perpage?: number;
}

@Resolver()
class RepositoriesResolver {
  @Query(_returns => [Repository])
  async repositories(@Args() args: RepositoriesArgs, @Ctx() ctx: GraphQLContext): Promise<Repository[]> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    checkPaginationArgs(args);
    const user = await UserModel.findById(ctx.auth.id);
    if (!user) {
      throw new Error('cannot find user');
    }
    const shouldParams: esb.Query[] = [];
    if (!args.projects || args.projects.length === 0) {
      if (user.repositories.length === 0 && user.projects.length === 0) {
        return [];
      }
      for (const repository of user.repositories) {
        shouldParams.push(esb.termQuery('_id', repository._id.toHexString()));
      }
    } else {
      for (const projectID of args.projects) {
        const project = await ProjectModel.findById(projectID);
        if (!project) {
          throw new Error(`cannot find project with id ${projectID.toHexString()}`);
        }
        if (!(await checkProjectAccess(user, project, AccessLevel.view))) {
          throw new Error('user does not have view access to project');
        }
        for (const repositoryID of project.repositories) {
          shouldParams.push(esb.termQuery('_id', repositoryID.toHexString()));
        }
      }
      if (shouldParams.length === 0) {
        return [];
      }
    }
    let requestBody = esb.requestBodySearch().query(
      esb.boolQuery()
        .filter(
          esb.boolQuery().should(shouldParams)
        )
    ).sort(esb.sort('_score', 'desc'));
    if (args.page !== undefined && args.perpage !== undefined) {
      requestBody = requestBody.from(args.page * args.perpage).size(args.perpage);
    }
    const elasticRepositoryData = await elasticClient.search({
      index: repositoryIndexName,
      body: requestBody.toJSON()
    });
    const result: Repository[] = [];
    for (const hit of elasticRepositoryData.body.hits.hits) {
      const currentRepository: Repository = {
        ...hit._source as Repository,
        _id: new ObjectId(hit._id as string),
        owner: new ObjectId(hit._source.owner),
        image: new ObjectId(hit._source.image)
      };
      result.push(currentRepository);
    }
    return result;
  }
}

export default RepositoriesResolver;
