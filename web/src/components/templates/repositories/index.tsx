import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Col, Row } from 'reactstrap';
import { PageProps, Link } from 'gatsby';

import './index.scss';

import { ApolloQueryResult } from 'apollo-client';
import { useMutation } from '@apollo/react-hooks';
import { toast } from 'react-toastify';
import {
  RepositoriesQueryVariables,
  RepositoriesQuery,
  Repositories,
  DeleteRepository,
  DeleteRepositoryMutationVariables,
  DeleteRepositoryMutation,
} from 'lib/generated/datamodel';
import { isSSR } from 'utils/checkSSR';
import { useSelector } from 'react-redux';
import { RootState } from 'state';
import { navigate } from '@reach/router';
import { RepositoriesMessages } from 'locale/templates/repositories/repositoriesMessages';
import ObjectId from 'bson-objectid';
import { AiFillDelete } from 'react-icons/ai';
import { client } from 'utils/apollo';
import DeleteRepositoryModal from './DeleteRepositoryModal';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RepositoriesPageDataProps extends PageProps {}

interface RepositoriesProps extends RepositoriesPageDataProps {
  messages: RepositoriesMessages;
}

const RepositoriesPage = (_args: RepositoriesProps): JSX.Element => {
  const [repositories, setRepositories] = useState<
    ApolloQueryResult<RepositoriesQuery> | undefined
  >(undefined);

  const [
    deleteRepositoryModalIsOpen,
    setDeleteRepositoryModalIsOpen,
  ] = useState(false);
  const deleteRepositoriesModalToggle = () =>
    setDeleteRepositoryModalIsOpen(!deleteRepositoryModalIsOpen);

  const [currentRepository, setCurrentRepository] = useState<
    ObjectId | undefined
  >(undefined);
  const [deleteRepositoryMutation] = useMutation<
    DeleteRepositoryMutation,
    DeleteRepositoryMutationVariables
  >(DeleteRepository);

  useEffect(() => {
    (async () => {
      try {
        const repositoriesRes = await client.query<
          RepositoriesQuery,
          RepositoriesQueryVariables
        >({
          query: Repositories,
          variables: {
            page: 0,
            perpage: 18,
          },
          fetchPolicy: 'network-only',
        });
        repositoriesRes.data.repositories.map((repository) => {
          repository._id = new ObjectId(repository._id);
        });
        setRepositories(repositoriesRes);
      } catch (err) {
        const errObj = err as Error;
        toast(errObj.message, {
          type: 'error',
        });
      }
    })();
  });

  const username = isSSR
    ? undefined
    : useSelector<RootState, string>((state) => state.authReducer.username);
  return (
    <>
      <Container
        style={{
          marginTop: '3rem',
          marginBottom: '2rem',
        }}
      >
        {!repositories || repositories.loading || !repositories.data ? (
          <p>loading...</p>
        ) : (
          <>
            {repositories.data.repositories.length === 0 ? (
              <p>no repositories found.</p>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <th>Repositories</th>
                  </tr>
                </thead>
                <tbody>
                  {repositories.data.repositories.map((repository) => {
                    return (
                      <tr key={(repository._id as ObjectId).toHexString()}>
                        <td>
                          <Row>
                            <Col>
                              <Link to={`/${username}/${repository.name}`}>
                                {repository.name}
                              </Link>
                            </Col>
                            <Col>
                              <Button
                                style={{
                                  color: '#818A91',
                                  backgroundColor: '#fff',
                                  border: '0px',
                                }}
                                onClick={(evt) => {
                                  evt.preventDefault();
                                  setCurrentRepository(repository._id);
                                  deleteRepositoriesModalToggle();
                                }}
                              >
                                <AiFillDelete />
                              </Button>
                            </Col>
                          </Row>
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
                navigate('/new?type=repository');
              }}
            >
              New Repository
            </Button>
            <DeleteRepositoryModal
              isOpen={deleteRepositoryModalIsOpen}
              toggle={deleteRepositoriesModalToggle}
              deleteRepository={async (): Promise<void> => {
                if (!currentRepository) return;
                await deleteRepositoryMutation({
                  variables: {
                    id: currentRepository,
                  },
                  update: () => {
                    setRepositories({
                      ...repositories,
                      loading: false,
                      data: {
                        repositories: repositories.data.repositories.filter(
                          (elem) =>
                            !(elem._id as ObjectId).equals(currentRepository)
                        ),
                      },
                    });
                  },
                });
              }}
            />
          </>
        )}
      </Container>
    </>
  );
};

export default RepositoriesPage;
