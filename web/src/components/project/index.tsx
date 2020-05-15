import React from 'react';
import { Container, Table } from 'reactstrap';
import { PageProps } from 'gatsby';

import './index.scss';

import SEO from '../../components/seo';
import { useSelector } from 'react-redux';
import { RootState } from '../../state';
import ObjectId from 'bson-objectid';
import { useQuery } from '@apollo/react-hooks';
import { toast } from 'react-toastify';
import {
  Repositories,
  RepositoriesQuery,
  RepositoriesQueryVariables,
} from '../../lib/generated/datamodel';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ProjectPageDataType {}

const ProjectPage = (_args: PageProps<ProjectPageDataType>) => {
  const project = useSelector<RootState, ObjectId | null>((state) => {
    return state.projectReducer.id
      ? new ObjectId(state.projectReducer.id)
      : null;
  });
  if (!project) {
    return <div></div>;
  }
  // https://www.apollographql.com/docs/react/api/react-hooks/#usequery

  const { loading, error, data } = useQuery<
    RepositoriesQuery,
    RepositoriesQueryVariables
  >(Repositories, {
    variables: {
      project,
    },
  });
  if (error) {
    toast(error.message, {
      type: 'error',
    });
  }
  return (
    <>
      <SEO title="Project" />
      <Container
        style={{
          marginTop: '3rem',
          marginBottom: '5rem',
        }}
      >
        <div>{project.toHexString()}</div>
        {loading ? (
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
                {data?.repositories.map((repository) => {
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
    </>
  );
};

export default ProjectPage;
