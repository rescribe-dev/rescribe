import React, { useState } from 'react';
import { Container, Table } from 'reactstrap';
import { PageProps } from 'gatsby';

import './index.scss';

import SEO from '../../components/seo';
import { useQuery } from '@apollo/react-hooks';
import { QueryResult } from '@apollo/react-common';
import { toast } from 'react-toastify';
import {
  Files,
  FilesQuery,
  FilesQueryVariables,
  RepositoryQuery,
  RepositoryQueryVariables,
  Repository,
} from '../../lib/generated/datamodel';
import PrivateRoute from '../../components/privateRoute';
import Layout from '../../layouts';
import { isSSR } from '../../utils/checkSSR';
import { client } from '../../utils/apollo';
import { ApolloQueryResult } from 'apollo-client';

type RepositoryPageDataType = PageProps;

const RepositoryPage = (args: RepositoryPageDataType) => {
  const splitPath = args.location.pathname.split('/');
  let repositoryName: string | undefined = undefined;
  if (splitPath.length >= 3) {
    repositoryName = splitPath[2];
  }
  const [filesData, setFilesData] = useState<
    ApolloQueryResult<FilesQuery> | undefined
  >(undefined);
  const repositoryQueryRes:
    | QueryResult<RepositoryQuery, RepositoryQueryVariables>
    | undefined =
    isSSR || repositoryName === undefined
      ? undefined
      : useQuery<RepositoryQuery, RepositoryQueryVariables>(Repository, {
          variables: {
            name: repositoryName,
          },
          onCompleted: async (data) => {
            setFilesData(
              await client.query<FilesQuery, FilesQueryVariables>({
                query: Files,
                variables: {
                  repositories: [data.repository._id],
                  page: 0,
                  perpage: 1,
                },
                fetchPolicy: 'no-cache',
              })
            );
          },
          onError: (err) => {
            toast(err.message, {
              type: 'error',
            });
          },
        });
  return (
    <PrivateRoute>
      <Layout location={args.location}>
        <SEO title="Repository" />
        {repositoryName ? (
          <Container>
            {!repositoryQueryRes ||
            repositoryQueryRes.loading ||
            !repositoryQueryRes.data ||
            !filesData ||
            filesData.loading ||
            !filesData.data ? (
              <p>loading...</p>
            ) : (
              <>
                {filesData.data.files.length === 0 ? (
                  <p>no files in repository {repositoryName}</p>
                ) : (
                  <Table>
                    <thead>
                      <tr>
                        <th>Files:</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {/*<th scope="row">1</th> */}
                        {filesData.data.files.map((file) => {
                          return (
                            <th scope="row" key={file._id}>
                              {file.name}
                            </th>
                          );
                        })}
                      </tr>
                    </tbody>
                  </Table>
                )}
              </>
            )}
          </Container>
        ) : (
          <p>Cannot find repository</p>
        )}
      </Layout>
    </PrivateRoute>
  );
};

export default RepositoryPage;
