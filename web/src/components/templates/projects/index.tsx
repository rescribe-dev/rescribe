import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Row, Col } from 'reactstrap';
import { PageProps, Link } from 'gatsby';

import './index.scss';

import { ApolloQueryResult } from 'apollo-client';
import { useMutation } from '@apollo/react-hooks';
import { toast } from 'react-toastify';
import {
  ProjectsQuery,
  ProjectsQueryVariables,
  Projects,
  DeleteProject,
  DeleteProjectMutation,
  DeleteProjectMutationVariables,
} from 'lib/generated/datamodel';
import { isSSR } from 'utils/checkSSR';
import { useSelector } from 'react-redux';
import { RootState } from 'state';
import { navigate } from '@reach/router';
import { ProjectsMessages } from 'locale/templates/projects/projectsMessages';
import ObjectID from 'bson-objectid';
import { client } from 'utils/apollo';
import { AiFillDelete } from 'react-icons/ai';
import DeleteProjectModal from './DeleteProjectModal';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ProjectsPageDataProps extends PageProps {}

interface ProjectsProps extends ProjectsPageDataProps {
  messages: ProjectsMessages;
}

const ProjectsPage = (_args: ProjectsProps): JSX.Element => {
  const [projects, setProjects] = useState<
    ApolloQueryResult<ProjectsQuery> | undefined
  >(undefined);

  const [deleteProjectModalIsOpen, setDeleteProjectModalIsOpen] = useState(
    false
  );
  const deleteProjectsModalToggle = () =>
    setDeleteProjectModalIsOpen(!deleteProjectModalIsOpen);

  const [currentProject, setcurrentProject] = useState<ObjectID | undefined>(
    undefined
  );

  const [deleteProjectMutation] = useMutation<
    DeleteProjectMutation,
    DeleteProjectMutationVariables
  >(DeleteProject);

  useEffect(() => {
    (async () => {
      try {
        const projectsRes = await client.query<
          ProjectsQuery,
          ProjectsQueryVariables
        >({
          query: Projects,
          variables: {
            page: 0,
            perpage: 18,
          },
          fetchPolicy: 'network-only',
        });
        projectsRes.data = {
          ...projectsRes.data,
          projects: projectsRes.data.projects.map((project) => ({
            ...project,
            _id: new ObjectID(project._id),
          })),
        };
        setProjects(projectsRes);
      } catch (err) {
        const errObj = err as Error;
        toast(errObj.message, {
          type: 'error',
        });
      }
    })();
  }, []);
  const username = isSSR
    ? undefined
    : useSelector<RootState, string>((state) => state.authReducer.username);
  return (
    <Container
      style={{
        marginTop: '3rem',
        marginBottom: '2rem',
      }}
    >
      {!projects || projects.loading || !projects.data ? (
        <p>loading...</p>
      ) : (
        <>
          {projects.data.projects.length === 0 ? (
            <p>no projects found.</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Projects:</th>
                </tr>
              </thead>
              <tbody>
                {projects.data.projects.map((project) => {
                  return (
                    <tr key={project._id}>
                      <td>
                        <Row>
                          <Col>
                            <Link to={`/${username}/projects/${project.name}`}>
                              {project.name}
                            </Link>
                          </Col>
                          <Col>
                            <Button
                              style={{
                                color: '#818A91',
                                backgroundColor: '#fff',
                                border: '0px',
                              }}
                              onClick={(evt) => {
                                evt.preventDefault();
                                setcurrentProject(project._id);
                                deleteProjectsModalToggle();
                              }}
                            >
                              <AiFillDelete />
                            </Button>
                          </Col>
                        </Row>
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
              navigate('/new?type=project', {
                replace: true,
              });
            }}
          >
            New Project
          </Button>
          <DeleteProjectModal
            isOpen={deleteProjectModalIsOpen}
            toggle={deleteProjectsModalToggle}
            deleteProject={async (): Promise<void> => {
              if (!currentProject) return;
              await deleteProjectMutation({
                variables: {
                  id: currentProject,
                },
                update: () => {
                  setProjects({
                    ...projects,
                    loading: false,
                    data: {
                      projects: projects.data.projects.filter(
                        (elem) => !(elem._id as ObjectID).equals(currentProject)
                      ),
                    },
                  });
                },
              });
            }}
          />
        </>
      )}
    </Container>
  );
};

export default ProjectsPage;
