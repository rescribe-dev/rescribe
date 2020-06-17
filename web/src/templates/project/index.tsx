import React, { useState } from 'react';
import { Container, Table } from 'reactstrap';
import { PageProps } from 'gatsby';

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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ProjectPageDataType extends PageProps {}

const ProjectPage = (args: ProjectPageDataType) => {
  const splitPath = args.location.pathname.split('/');
  let projectName: string | undefined = undefined;
  if (splitPath.length >= 3) {
    projectName = splitPath[2];
  }
  const [repositoriesData, setRepositoriesData] = useState<
    ApolloQueryResult<RepositoriesQuery> | undefined
  >(undefined);
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
                  <p>no files in project {projectName}</p>
                ) : (
                  <Table>
                    <thead>
                      <tr>
                        <th>Repositories:</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {/*<th scope="row">1</th> */}
                        {repositoriesData.data.repositories.map(
                          (repository) => {
                            return (
                              <th scope="row" key={repository._id}>
                                {repository.name}
                              </th>
                            );
                          }
                        )}
                      </tr>
                    </tbody>
                  </Table>
                )}
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
