import React from 'react';
import {
  Container,
  Table,
  Button,
  // Modal,
  // ModalBody,
  // ModalFooter,
  // ModalHeader,
} from 'reactstrap';
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
import { RepositoriesMessages } from 'locale/templates/repositories/repositoriesMessages';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RepositoriesPageDataProps extends PageProps {}

interface RepositoriesProps extends RepositoriesPageDataProps {
  messages: RepositoriesMessages;
}

// interface ModalArgs {
//   deleteRepository: () => Promise<void>;
//   toggle: () => void;
//   isOpen: boolean;
// }

const RepositoriesPage = (
  _args: RepositoriesProps,
  _modalArgs: ModalArgs
): JSX.Element => {
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
          {repositoriesQueryRes.data.repositories.length === 0 ? (
            <p>no Repositories found.</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Repositories:</th>
                </tr>
              </thead>
              <tbody>
                {repositoriesQueryRes.data.repositories.map((repository) => {
                  return (
                    <tr key={repository._id}>
                      <td>
                        <Link to={`/${username}/projects/${repository.name}`}>
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
              navigate('/new?type=project');
            }}
          >
            New Repositories
          </Button>
          {/* <Modal isOpen={_modalArgs.isOpen} toggle={_modalArgs.toggle}>
            <ModalHeader toggle={_modalArgs.toggle}>Delete Repository</ModalHeader>
            <ModalBody>Are you sure?</ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                onClick={async () => {
                  await args.deleteFolder();
                  args.toggle();
                }}
              >
                Delete
              </Button>{" "}
              <Button color="secondary" onClick={args.toggle}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal> */}
        </>
      )}
    </Container>
  );
};

export default RepositoriesPage;
