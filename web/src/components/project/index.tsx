import React from 'react';
import { Container, Table } from 'reactstrap';
import { PageProps } from 'gatsby';

import './index.scss';

import SEO from '../../components/seo';
import { useSelector } from 'react-redux';
import { RootState } from '../../state';
import ObjectId from 'bson-objectid';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { toast } from 'react-toastify';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ProjectPageDataType {}

interface Repository {
  _id: string;
  name: string;
}

interface RepositoryRes {
  repositories: Repository[];
}

const ProjectPage = (_args: PageProps<ProjectPageDataType>) => {
  const project = useSelector<RootState, ObjectId | null>((state) => {
    return state.projectReducer.id
      ? new ObjectId(state.projectReducer.id)
      : null;
  });
  if (!project) {
    return null;
  }
  // https://www.apollographql.com/docs/react/api/react-hooks/#usequery

  const { loading, error, data } = useQuery<RepositoryRes>(
    gql`
      query repositories($project: ObjectId!) {
        repositories(project: $project) {
          _id
          name
        }
      }
    `,
    {
      variables: {
        project,
      },
    }
  );
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
