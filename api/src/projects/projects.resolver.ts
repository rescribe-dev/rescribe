import { Resolver, Query, Ctx, ArgsType, Field, Int, Args } from 'type-graphql';
import { elasticClient } from '../elastic/init';
import { projectIndexName } from '../elastic/settings';
import { ObjectId } from 'mongodb';
import { Project } from '../schema/structure/project';
import { RequestParams } from '@elastic/elasticsearch';
import { GraphQLContext } from '../utils/context';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/users/user';
import { TermQuery } from '../elastic/types';
import { Min, Max } from 'class-validator';
import { checkPaginationArgs, setPaginationArgs } from '../elastic/pagination';

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
    const shouldParams: TermQuery[] = [];
    for (const project of user.projects) {
      shouldParams.push({
        term: {
          _id: project._id.toHexString()
        }
      });
    }
    const searchParams: RequestParams.Search = {
      index: projectIndexName,
      body: {
        query: {
          bool: {
            should: shouldParams
          }
        }
      }
    };
    setPaginationArgs(args, searchParams);
    const elasticProjectData = await elasticClient.search(searchParams);
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
