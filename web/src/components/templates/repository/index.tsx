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
import { ApolloQueryResult } from 'apollo-client';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RepositoryPageDataProps extends PageProps {}

interface RepositoryProps extends RepositoryPageDataProps {
  messages: RepositoryMessages;
}

const RepositoryPage = (args: RepositoryProps): JSX.Element => {
  const [repositoryName, setRepositoryName] = useState<string | null>(null);
  const [repositoryQueryRes, setRepositoryQueryRes] = useState<
    ApolloQueryResult<RepositoryQuery> | undefined
  >(undefined);
  useEffect(() => {
    const splitPath = args.location.pathname.split('/');
    let localRepositoryName: string | undefined = undefined;
    if (splitPath.length === 3) {
      localRepositoryName = splitPath[2];
    }
    if (!localRepositoryName) {
      return;
    }
    setRepositoryName(localRepositoryName);
    client
      .query<RepositoryQuery, RepositoryQueryVariables>({
        query: Repository,
        variables: {
          name: localRepositoryName,
        },
      })
      .then((res) => {
        setRepositoryQueryRes(res);
      })
      .catch((err) => {
        toast(err.message, {
          type: 'error',
        });
        navigate('/404');
      });
  }, []);
  return (
    <Container>
      {repositoryName ? (
        <>
          {!repositoryQueryRes ||
          repositoryQueryRes.loading ||
          !repositoryQueryRes.data ? (
            <p>loading...</p>
          ) : (
            <Files
              repositoryID={repositoryQueryRes.data.repository._id}
              repositoryName={repositoryName}
            />
          )}
        </>
      ) : (
        <p>Cannot find repository</p>
      )}
    </Container>
  );
};

export default RepositoryPage;
