/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query } from 'type-graphql';
import { File, Project } from '../schema/structure';
import { elasticClient } from '../elastic/init';
import { projectIndexName } from '../elastic/settings';
import { getLogger } from 'log4js';

const logger = getLogger();

@ArgsType()
class ProjectsArgs {}

@Resolver()
class ProjectsResolver {
  @Query(_returns => File)
  async projects(@Args() _args: ProjectsArgs): Promise<Project[]> {
    const projectData = await elasticClient.search({
      index: projectIndexName,
      body: {
        query: {
          match_all: {}
        }
      }
    });
    logger.info(projectData.body.hits);
    return [];
  }
}

export default ProjectsResolver;
