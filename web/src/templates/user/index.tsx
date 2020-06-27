import React, { useState, useEffect } from 'react';
import { Container } from 'reactstrap';
import { PageProps, navigate } from 'gatsby';

import './index.scss';
import SEO from '../../components/seo';
import { useSelector } from 'react-redux';
import { RootState } from '../../state';
import Layout from '../../layouts';
import { isSSR } from '../../utils/checkSSR';
import {
  UserFieldsFragment,
  PublicUser,
  PublicUserQuery,
  PublicUserFieldsFragment,
  PublicUserQueryVariables,
} from '../../lib/generated/datamodel';
import { client } from '../../utils/apollo';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface UserPageDataType extends PageProps {}

const UserPage = (args: UserPageDataType): JSX.Element => {
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
    <>
      <Layout location={args.location}>
        <SEO title={user ? user.username : 'User'} />
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
      </Layout>
    </>
  );
};

export default UserPage;
