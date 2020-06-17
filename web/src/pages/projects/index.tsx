import React from 'react';
import { Container, Table } from 'reactstrap';
import { PageProps, Link } from 'gatsby';

import './index.scss';

import SEO from '../../components/seo';
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
import { useSelector } from 'react-redux';
import { RootState } from '../../state';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ProjectsPageDataType extends PageProps {}

const ProjectsPage = (args: ProjectsPageDataType) => {
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
  const username = isSSR
    ? undefined
    : useSelector<RootState, string>((state) => state.authReducer.username);
  if (projectsQueryRes && projectsQueryRes.error) {
    toast(projectsQueryRes.error.message, {
      type: 'error',
    });
  }
  return (
    <PrivateRoute>
      <Layout location={args.location}>
        <SEO title="Projects" />
        {!projectsQueryRes ||
        projectsQueryRes.loading ||
        !projectsQueryRes.data ? (
          <p>loading...</p>
        ) : (
          <>
            {projectsQueryRes.data.projects.length === 0 ? (
              <p>no projects found.</p>
            ) : (
              <Container className="default-container">
                <Table>
                  <thead>
                    <tr>
                      <th>Projects:</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectsQueryRes.data.projects.map((project) => {
                      return (
                        <tr key={project._id}>
                          <td>
                            <Link to={`/${username}/projects/${project.name}`}>
                              {project.name}
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Container>
            )}
          </>
        )}
      </Layout>
    </PrivateRoute>
  );
};

export default ProjectsPage;
