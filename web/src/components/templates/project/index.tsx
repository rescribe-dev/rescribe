import React, { useState } from 'react';
import { Container, Table, Button } from 'reactstrap';
import { PageProps, Link, navigate } from 'gatsby';

import './index.scss';

import { useQuery, QueryResult } from '@apollo/react-hooks';
import { toast } from 'react-toastify';
import {
  Repositories,
  RepositoriesQuery,
  RepositoriesQueryVariables,
  ProjectQuery,
  ProjectQueryVariables,
  Project,
} from 'lib/generated/datamodel';
import { isSSR } from 'utils/checkSSR';
import { ApolloQueryResult } from 'apollo-client';
import { client } from 'utils/apollo';
import { useSelector } from 'react-redux';
import { RootState } from 'state';
import { ProjectMessages } from 'locale/templates/project/projectMessages';
import { getErrorCode } from 'utils/misc';
import { NOT_FOUND } from 'http-status-codes';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ProjectPageDataProps extends PageProps {}

interface ProjectProps extends ProjectPageDataProps {
  messages: ProjectMessages;
}

const ProjectPage = (args: ProjectProps): JSX.Element => {
  const splitPath = args.location.pathname.split('/');
  let projectName: string | undefined = undefined;
  if (splitPath.length === 4) {
    projectName = splitPath[3];
  } else if (splitPath.length === 5) {
    projectName = splitPath[4];
  }
  const [repositoriesData, setRepositoriesData] = useState<
    ApolloQueryResult<RepositoriesQuery> | undefined
  >(undefined);
  const username = isSSR
    ? undefined
    : useSelector<RootState, string>((state) => state.authReducer.username);
  const projectQueryRes:
    | QueryResult<ProjectQuery, ProjectQueryVariables>
    | undefined =
    isSSR || projectName === undefined
      ? undefined
      : useQuery<ProjectQuery, ProjectQueryVariables>(Project, {
          variables: {
            name: projectName,
          },
          onError: (err) => {
            const errorCode = getErrorCode(err);
            if (errorCode === NOT_FOUND) {
              navigate('/404', {
                state: {
                  location: window.location.href,
                },
              });
            } else {
              toast(err.message, {
                type: 'error',
              });
            }
          },
          onCompleted: async (data) => {
            setRepositoriesData(
              await client.query<RepositoriesQuery, RepositoriesQueryVariables>(
                {
                  query: Repositories,
                  variables: {
                    projects: [data.project._id],
                    page: 0,
                    perpage: 1,
                  },
                  fetchPolicy: 'no-cache',
                }
              )
            );
          },
        });

  return (
    <>
      {projectName ? (
        <Container className="default-container">
          {!projectQueryRes ||
          projectQueryRes.loading ||
          !projectQueryRes.data ||
          !repositoriesData ||
          repositoriesData.loading ||
          !repositoriesData.data ? (
            <p>loading...</p>
          ) : (
            <>
              {repositoriesData.data.repositories.length === 0 ? (
                <p>no repositories in project {projectName}</p>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <th>Repositories:</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repositoriesData.data.repositories.map((repository) => {
                      return (
                        <tr key={repository._id}>
                          <td>
                            <Link to={`/${username}/${repository.name}`}>
                              {repository.name}
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
                  navigate(`/new?type=repository&project=${projectName}`);
                }}
              >
                New Repository
              </Button>
            </>
          )}
        </Container>
      ) : (
        <p>cannot find project!</p>
      )}
    </>
  );
};

export default ProjectPage;
