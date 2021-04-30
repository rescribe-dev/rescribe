import React, { useEffect, useState } from 'react';
import { Container } from 'reactstrap';
import { PageProps, navigate } from 'gatsby';
import Files from 'components/Files';

import './index.scss';

import { toast } from 'react-toastify';
import {
  RepositoryQuery,
  RepositoryQueryVariables,
  Repository,
} from 'lib/generated/datamodel';

import { RepositoryMessages } from 'locale/templates/repository/repositoryMessages';
import { client } from 'utils/apollo';
import { ApolloQueryResult, ApolloError } from '@apollo/client';
import { capitalizeFirstLetter, getErrorCode } from 'utils/misc';
import statusCodes from 'http-status-codes';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RepositoryPageDataProps extends PageProps {}

interface RepositoryProps extends RepositoryPageDataProps {
  messages: RepositoryMessages;
}

const RepositoryPage = (args: RepositoryProps): JSX.Element => {
  const [repositoryOwner, setRepositoryOwner] = useState<string | null>(null);
  const [repositoryName, setRepositoryName] = useState<string | null>(null);
  const [repositoryQueryRes, setRepositoryQueryRes] = useState<
    ApolloQueryResult<RepositoryQuery> | undefined
  >(undefined);
  useEffect(() => {
    const splitPath = args.location.pathname.split('/');
    let localRepositoryName: string | null = null;
    let localRepositoryOwner: string | null = null;
    if (splitPath.length >= 3) {
      localRepositoryOwner = splitPath[1];
      localRepositoryName = splitPath[2];
    }
    if (!localRepositoryName || !localRepositoryOwner) {
      return;
    }
    setRepositoryName(localRepositoryName);
    setRepositoryOwner(localRepositoryOwner);
    client
      .query<RepositoryQuery, RepositoryQueryVariables>({
        query: Repository,
        variables: {
          name: localRepositoryName,
          owner: localRepositoryOwner,
        },
      })
      .then((res) => {
        setRepositoryQueryRes(res);
      })
      .catch((err: ApolloError) => {
        const errorCode = getErrorCode(err);
        if (errorCode === statusCodes.NOT_FOUND) {
          navigate('/404', {
            state: {
              location: window.location.href,
            },
          });
        } else {
          toast(err.message, {
            type: 'error',
          });
        }
      });
  }, []);
  return (
    <Container>
      {repositoryName ? (
        <>
          {!repositoryOwner ||
          !repositoryQueryRes ||
          repositoryQueryRes.loading ||
          !repositoryQueryRes.data ? (
            <p>loading...</p>
          ) : (
            <>
              <h2
                style={{
                  marginBottom: '2rem',
                }}
              >
                Repository {capitalizeFirstLetter(repositoryName)}
              </h2>
              {repositoryQueryRes.data.repository.branches.length === 0 ? (
                <p>no branches</p>
              ) : (
                <Files
                  repositoryID={repositoryQueryRes.data.repository._id}
                  repositoryName={repositoryName}
                  defaultBranch={repositoryQueryRes.data.repository.branches[0]}
                  repositoryOwner={repositoryOwner}
                  location={args.location}
                />
              )}
            </>
          )}
        </>
      ) : (
        <p>Cannot find repository</p>
      )}
    </Container>
  );
};

export default RepositoryPage;
