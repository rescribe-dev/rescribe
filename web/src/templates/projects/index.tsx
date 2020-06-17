import React from 'react';
import { Container, Table, Button } from 'reactstrap';
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
import { navigate } from '@reach/router';

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
        onError: (err) => {
          toast(err.message, {
            type: 'error',
          });
        },
      });
  const username = isSSR
    ? undefined
    : useSelector<RootState, string>((state) => state.authReducer.username);
  return (
    <PrivateRoute>
      <Layout location={args.location}>
        <SEO title="Projects" />
        <Container className="default-container">
          {!projectsQueryRes ||
          projectsQueryRes.loading ||
          !projectsQueryRes.data ? (
            <p>loading...</p>
          ) : (
            <>
              {projectsQueryRes.data.projects.length === 0 ? (
                <p>no projects found.</p>
              ) : (
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
              )}
              <Button
                onClick={(evt) => {
                  evt.preventDefault();
                  navigate('/new?type=project');
                }}
              >
                New Project
              </Button>
            </>
          )}
        </Container>
      </Layout>
    </PrivateRoute>
  );
};

export default ProjectsPage;
