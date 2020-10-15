import React, { useState } from 'react';
import { Container, Table, Button } from 'reactstrap';
import { Link, navigate } from 'gatsby';

import './index.scss';

import { useQuery, QueryResult } from '@apollo/react-hooks';
import { toast } from 'react-toastify';
import {
  Repositories,
  RepositoriesQuery,
  RepositoriesQueryVariables,
} from 'lib/generated/datamodel';
import { isSSR } from 'utils/checkSSR';
import { ApolloQueryResult } from 'apollo-client';
import { client } from 'utils/apollo';
import { useSelector } from 'react-redux';
import { RootState } from 'state';
import { getErrorCode } from 'utils/misc';
import statusCodes from 'http-status-codes';
import ObjectId from 'bson-objectid';

interface RepoListProps {
  project?: ObjectId;
}

const ProjectPage = (_args: RepoListProps): JSX.Element => {
  const [repositoriesData, setRepositoriesData] = useState<
    ApolloQueryResult<RepositoriesQuery> | undefined
  >(undefined);
  const username = isSSR
    ? undefined
    : useSelector<RootState, string>((state) => state.authReducer.username);
  const projectQueryRes:
    | QueryResult<RepositoriesQuery, RepositoriesQueryVariables>
    | undefined =
    isSSR || projectName === undefined
      ? undefined
      : useQuery<RepositoriesQuery, RepositoriesQueryVariables>(Project, {
          variables: {
            name: projectName,
          },
          onError: (err) => {
            const errorCode = getErrorCode(err);
            if (errorCode === statusCodes.NOT_FOUND) {
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
            //TODO: properly handle pagination
            setRepositoriesData(
              await client.query<RepositoriesQuery, RepositoriesQueryVariables>(
                {
                  query: Repositories,
                  variables: {
                    projects: [data.project._id, data.repositories],
                    page: 0,
                    perpage: 18,
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
        <Container>
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
