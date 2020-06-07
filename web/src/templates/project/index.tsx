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
  Repositories,
  RepositoriesQuery,
  RepositoriesQueryVariables,
} from '../../lib/generated/datamodel';
import PrivateRoute from '../../components/privateRoute';
import Layout from '../../layouts';
import { isSSR } from '../../utils/checkSSR';
import '../styles';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ProjectPageDataType extends PageProps {}

const ProjectPage = (args: ProjectPageDataType) => {
  const splitPath = args.location.pathname.split('/project/');
  let project: ObjectId | undefined = undefined;
  if (splitPath.length === 2) {
    const idString = splitPath[1];
    if (ObjectId.isValid(idString)) {
      project = new ObjectId(splitPath[1]);
    }
  }

  const projectQueryRes:
    | QueryResult<RepositoriesQuery, RepositoriesQueryVariables>
    | undefined =
    isSSR || project === undefined
      ? undefined
      : useQuery<RepositoriesQuery, RepositoriesQueryVariables>(Repositories, {
          variables: {
            projects: [project],
            page: 0,
            perpage: 1,
          },
        });

  if (projectQueryRes && projectQueryRes.error) {
    toast(projectQueryRes.error.message, {
      type: 'error',
    });
  }
  return (
    <PrivateRoute>
      <Layout location={args.location}>
        <SEO title="Project" />
        {project ? (
          <Container
            className='default-container'
          >
            <div>{project.toHexString()}</div>
            {!projectQueryRes || projectQueryRes.loading ? (
              <p>loading...</p>
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
                    {projectQueryRes.data?.repositories.map((repository) => {
                      return (
                        <th scope="row" key={repository._id}>
                          {repository.name}
                        </th>
                      );
                    })}
                  </tr>
                </tbody>
              </Table>
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
