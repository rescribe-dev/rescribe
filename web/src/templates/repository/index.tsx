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
  Files,
  FilesQuery,
  FilesQueryVariables,
} from '../../lib/generated/datamodel';
import PrivateRoute from '../../components/privateRoute';
import Layout from '../../layouts';
import { isSSR } from '../../utils/checkSSR';

type RepositoryPageDataType = PageProps;

const RepositoryPage = (args: RepositoryPageDataType) => {
  const splitPath = args.location.pathname.split('/repository/');
  let repository: ObjectId | undefined = undefined;
  if (splitPath.length === 2) {
    const idString = splitPath[1];
    if (ObjectId.isValid(idString)) {
      repository = new ObjectId(splitPath[1]);
    }
  }

  const repositoryQueryRes:
    | QueryResult<FilesQuery, FilesQueryVariables>
    | undefined =
    isSSR || repository === undefined
      ? undefined
      : useQuery<FilesQuery, FilesQueryVariables>(Files, {
          variables: {
            repositories: [repository],
            page: 0,
            perpage: 1,
          },
        });

  if (repositoryQueryRes && repositoryQueryRes.error) {
    toast(repositoryQueryRes.error.message, {
      type: 'error',
    });
  }

  return (
    <PrivateRoute>
      <Layout location={args.location}>
        <SEO title="Repository" />
        {repository ? (
          <Container className="default-container">
            <div>{repository.toHexString()}</div>
            {!repositoryQueryRes || repositoryQueryRes.loading ? (
              <p>loading...</p>
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
                    {repositoryQueryRes.data?.files.map((file) => {
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
          </Container>
        ) : (
          <p>Cannot find file</p>
        )}
      </Layout>
    </PrivateRoute>
  );
};

export default RepositoryPage;
