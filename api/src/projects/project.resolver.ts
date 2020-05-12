/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query, Field } from 'type-graphql';
import { ProjectModel, ProjectDB } from '../schema/project';

@ArgsType()
class ProjectArgs {
  @Field({ description: 'repository name' })
  name: string;
}

@Resolver()
class BranchResolver {
  @Query(_returns => ProjectDB)
  async project(@Args() args: ProjectArgs): Promise<ProjectDB> {
    const projectResult = await ProjectModel.findOne({
      name: args.name
    });
    if (!projectResult) {
      throw new Error('cannot find project');
    }
    return projectResult;
  }
}

export default BranchResolver;
