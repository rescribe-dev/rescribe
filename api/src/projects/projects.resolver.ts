import { Resolver, Query, Ctx, ArgsType, Field, Int, Args } from 'type-graphql';
import { elasticClient } from '../elastic/init';
import { projectIndexName } from '../elastic/settings';
import { ObjectId } from 'mongodb';
import { Project } from '../schema/structure/project';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/users/user';
import { Min, Max } from 'class-validator';
import esb from 'elastic-builder';
import { checkPaginationArgs } from '../elastic/pagination';

const maxPerPage = 20;

@ArgsType()
export class ProjectsArgs {
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
class ProjectsResolver {
  @Query(_returns => [Project])
  async projects(@Args() args: ProjectsArgs, @Ctx() ctx: GraphQLContext): Promise<Project[]> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    checkPaginationArgs(args);
    const user = await UserModel.findById(ctx.auth.id);
    if (!user) {
      throw new Error('cannot find user');
    }
    if (user.projects.length === 0) {
      return [];
    }
    const shouldParams: esb.Query[] = [];
    for (const project of user.projects) {
      shouldParams.push(esb.termQuery('_id', project._id.toHexString()));
    }
    let requestBody = esb.requestBodySearch().query(
      esb.boolQuery()
        .should(shouldParams)
    ).sort(esb.sort('_score', 'desc'));
    if (args.page !== undefined && args.perpage !== undefined) {
      requestBody = requestBody.from(args.page * args.perpage).size(args.perpage);
    }
    const elasticProjectData = await elasticClient.search({
      index: projectIndexName,
      body: requestBody.toJSON()
    });
    const result: Project[] = [];
    for (const hit of elasticProjectData.body.hits.hits) {
      const currentProject: Project = {
        ...hit._source as Project,
        _id: new ObjectId(hit._id as string),
        owner: new ObjectId(hit._source.owner)
      };
      result.push(currentProject);
    }
    return result;
  }
}

export default ProjectsResolver;
