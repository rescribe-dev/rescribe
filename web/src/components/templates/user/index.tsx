import React, { useState, useEffect } from 'react';
import { Container } from 'reactstrap';
import { PageProps, navigate } from 'gatsby';

import './index.scss';
import { useSelector } from 'react-redux';
import { RootState } from 'state';
import { isSSR } from 'utils/checkSSR';
import {
  UserFieldsFragment,
  PublicUser,
  PublicUserQuery,
  PublicUserFieldsFragment,
  PublicUserQueryVariables,
} from 'lib/generated/datamodel';
import { client } from 'utils/apollo';
import { UserMessages } from 'locale/templates/user/userMessages';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserPageDataProps extends PageProps {}

interface UserProps extends UserPageDataProps {
  messages: UserMessages;
}

const UserPage = (args: UserProps): JSX.Element => {
  const splitPath = args.location.pathname.split('/');
  let username: string | undefined = undefined;
  if (splitPath.length === 2) {
    username = splitPath[1];
  } else if (splitPath.length === 3) {
    username = splitPath[2];
  }
  const currentUser = isSSR
    ? undefined
    : useSelector<RootState, UserFieldsFragment | undefined>(
        (state) => state.authReducer.user
      );
  const [user, setUser] = useState<PublicUserFieldsFragment | undefined>(
    undefined
  );
  useEffect(() => {
    if (currentUser && username === currentUser.username) {
      console.log('set current user');
      setUser(currentUser as PublicUserFieldsFragment);
    } else if (!isSSR) {
      console.log('get user');
      client
        .query<PublicUserQuery | undefined, PublicUserQueryVariables>({
          query: PublicUser,
          variables: {
            username: username as string,
          },
          fetchPolicy: 'no-cache', // disable cache
        })
        .then((res) => setUser(res.data?.publicUser))
        .catch((_err: Error) => navigate('/404'));
    }
  }, []);
  return (
    <Container className="default-container">
      <div>
        {user === undefined ? (
          <div>loading</div>
        ) : (
          <div>
            <p>{JSON.stringify(user)}</p>
          </div>
        )}
      </div>
    </Container>
  );
};

export default UserPage;