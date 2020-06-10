import React from 'react';
import { Container, Table } from 'reactstrap';
import { PageProps } from 'gatsby';

import './index.scss';

import SEO from '../../components/seo';
import ObjectId from 'bson-objectid';
import { useQuery } from '@apollo/react-hooks';
import { QueryResult } from '@apollo/react-common';
import { toast } from 'react-toastify';
import {
  ProjectsQuery,
  ProjectsQueryVariables,
  Projects,
} from '../../lib/generated/datamodel';
import PrivateRoute from '../../components/privateRoute';
import Layout from '../../layouts';
import { isSSR } from '../../utils/checkSSR';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ProjectsPageDataType extends PageProps {}

const ProjectsPage = (args: ProjectsPageDataType) => {
  const splitPath = args.location.pathname.split('/project/');
  let project: ObjectId | undefined = undefined;
  if (splitPath.length === 2) {
    const idString = splitPath[1];
    if (ObjectId.isValid(idString)) {
      project = new ObjectId(splitPath[1]);
    }
  }
  const projectsQueryRes:
    | QueryResult<ProjectsQuery, ProjectsQueryVariables>
    | undefined = isSSR
    ? undefined
    : useQuery<ProjectsQuery, ProjectsQueryVariables>(Projects, {
        variables: {
          page: 0,
          perpage: 1,
        },
      });

  if (projectsQueryRes && projectsQueryRes.error) {
    toast(projectsQueryRes.error.message, {
      type: 'error',
    });
  }
  return (
    <PrivateRoute>
      <Layout location={args.location}>
        <SEO title="Project" />
        {project ? (
          <Container className="default-container">
            <div>{project.toHexString()}</div>
            {!projectsQueryRes || projectsQueryRes.loading ? (
              <p>loading...</p>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <th>Projects:</th>
                  </tr>
                </thead>
                <tbody>
                  {projectsQueryRes.data?.projects.map((project) => {
                    return (
                      <tr key={project._id}>
                        <td>{project.name}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </Container>
        ) : (
          <p>cannot find projects</p>
        )}
      </Layout>
    </PrivateRoute>
  );
};

export default ProjectsPage;
