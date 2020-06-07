import React from 'react';
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
import { useQuery } from '@apollo/react-hooks';
import 'index.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface UserPageDataType extends PageProps {}

const UserPage = (args: UserPageDataType) => {
  const splitPath = args.location.pathname.split('/');
  let username: string | undefined = undefined;
  if (splitPath.length === 2) {
    username = splitPath[1];
  }
  const currentUser = isSSR
    ? undefined
    : useSelector<RootState, UserFieldsFragment | undefined>(
        (state) => state.authReducer.user
      );
  let user: PublicUserFieldsFragment | undefined;
  if (currentUser && username === currentUser.username) {
    user = currentUser as PublicUserFieldsFragment;
  } else if (!isSSR) {
    const publicUserRes = useQuery<
      PublicUserQuery | undefined,
      PublicUserQueryVariables
    >(PublicUser, {
      variables: {
        username: username as string,
      },
      fetchPolicy: 'no-cache', // disable cache
    });
    if (publicUserRes.error) {
      navigate('/404');
    } else if (publicUserRes.data) {
      user = publicUserRes.data.publicUser;
    }
  }
  return (
    <>
      <Layout location={args.location}>
        <SEO title={user ? user.username : 'User'} />
        <Container
          className='default-container'
        >
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
