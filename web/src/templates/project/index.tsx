import React, { useState } from 'react';
import { Container, Table, Button } from 'reactstrap';
import { PageProps, Link, navigate } from 'gatsby';

import './index.scss';

import SEO from '../../components/seo';
import { useQuery } from '@apollo/react-hooks';
import { QueryResult } from '@apollo/react-common';
import { toast } from 'react-toastify';
import {
  Repositories,
  RepositoriesQuery,
  RepositoriesQueryVariables,
  ProjectQuery,
  ProjectQueryVariables,
  Project,
} from '../../lib/generated/datamodel';
import PrivateRoute from '../../components/privateRoute';
import Layout from '../../layouts';
import { isSSR } from '../../utils/checkSSR';
import { ApolloQueryResult } from 'apollo-client';
import { client } from '../../utils/apollo';
import { useSelector } from 'react-redux';
import { RootState } from '../../state';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ProjectPageDataType extends PageProps {}

const ProjectPage = (args: ProjectPageDataType): JSX.Element => {
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
            console.log(JSON.stringify(err));
            toast(err.message, {
              type: 'error',
            });
            navigate('/404');
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
    <PrivateRoute>
      <Layout location={args.location}>
        <SEO title="Project" />
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
      </Layout>
    </PrivateRoute>
  );
};

export default ProjectPage;
