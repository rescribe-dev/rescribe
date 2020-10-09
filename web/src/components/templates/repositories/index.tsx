import React from 'react';
import { Container, Table, Button } from 'reactstrap';
import { PageProps, Link } from 'gatsby';

import './index.scss';

import { useQuery, QueryResult } from '@apollo/react-hooks';
import { toast } from 'react-toastify';
import {
  RepositoriesQueryVariables,
  RepositoriesQuery,
  Repositories,
} from 'lib/generated/datamodel';
import { isSSR } from 'utils/checkSSR';
import { useSelector } from 'react-redux';
import { RootState } from 'state';
import { navigate } from '@reach/router';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RepositoriesPageDataProps extends PageProps {}

interface RepositoriesProps extends RepositoriesPageDataProps {
  messages: RepositoriesMessages;
}

const RepositoriesPage = (_args: RepositoriesProps): JSX.Element => {
  const repositoriesQueryRes:
    | QueryResult<RepositoriesQuery, RepositoriesQueryVariables>
    | undefined = isSSR
    ? undefined
    : //TODO: properly handle pagination
      useQuery<RepositoriesQuery, RepositoriesQueryVariables>(Repositories, {
        variables: {
          page: 0,
          perpage: 18,
        },
        onError: (err) => {
          toast(err.message, {
            type: 'error',
          });
        },
      });
  const username = isSSR
    ? undefined
    : useSelector<RootState, string>((state) => state.authReducer.username);
  return (
    <Container className="default-container">
      {!repositoriesQueryRes ||
      repositoriesQueryRes.loading ||
      !repositoriesQueryRes.data ? (
        <p>loading...</p>
      ) : (
        <>
          {repositoriesQueryRes.data.projects.length === 0 ? (
            <p>no Repositories found.</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Repositories:</th>
                </tr>
              </thead>
              <tbody>
                {repositoriesQueryRes.data.projects.map((repositories) => {
                  return (
                    <tr key={Repositories._id}>
                      <td>
                        <Link
                          to={`/${username}/projects/${respositories.name}`}
                        >
                          {repositories.name}
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
              navigate('/new?type=project');
            }}
          >
            New Repositories
          </Button>
        </>
      )}
    </Container>
  );
};

export default RepositoriesPage;
