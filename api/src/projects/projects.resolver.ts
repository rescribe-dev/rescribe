/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query } from 'type-graphql';
import { Project } from '../schema/structure';
import { elasticClient } from '../elastic/init';
import { projectIndexName } from '../elastic/settings';
import { ObjectId } from 'mongodb';

@ArgsType()
class ProjectsArgs {}

@Resolver()
class ProjectsResolver {
  @Query(_returns => [Project])
  async projects(@Args() _args: ProjectsArgs): Promise<Project[]> {
    const elasticProjectData = await elasticClient.search({
      index: projectIndexName,
      body: {
        query: {
          match_all: {}
        }
      }
    });
    const result: Project[] = [];
    for (const hit of elasticProjectData.body.hits.hits) {
      const currentProject: Project = {
        _id: new ObjectId(hit._id),
        ...hit._source
      };
      result.push(currentProject);
    }
    return result;
  }
}

export default ProjectsResolver;
