import React from 'react';
import { Container, Table, Button } from 'reactstrap';
import { PageProps, Link } from 'gatsby';

import './index.scss';

import { useQuery, QueryResult } from '@apollo/react-hooks';
import { toast } from 'react-toastify';
import {
  ProjectsQuery,
  ProjectsQueryVariables,
  Projects,
} from 'lib/generated/datamodel';
import { isSSR } from 'utils/checkSSR';
import { useSelector } from 'react-redux';
import { RootState } from 'state';
import { navigate } from '@reach/router';
import { ProjectsMessages } from 'locale/templates/projects/projectsMessages';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ProjectsPageDataProps extends PageProps {}

interface ProjectsProps extends ProjectsPageDataProps {
  messages: ProjectsMessages;
}

const ProjectsPage = (_args: ProjectsProps): JSX.Element => {
  const projectsQueryRes:
    | QueryResult<ProjectsQuery, ProjectsQueryVariables>
    | undefined = isSSR
    ? undefined
    : //TODO: properly handle pagination
      useQuery<ProjectsQuery, ProjectsQueryVariables>(Projects, {
        variables: {
          page: 0,
          perpage: 18,
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
  );
};

export default ProjectsPage;
