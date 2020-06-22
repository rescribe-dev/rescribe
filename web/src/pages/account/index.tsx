import React from 'react';
import { Container } from 'reactstrap';
import { PageProps } from 'gatsby';

import './index.scss';

import SEO from '../../components/seo';
import { useDispatch, useSelector } from 'react-redux';
import { AuthActionTypes } from '../../state/auth/types';
import { AppThunkDispatch } from '../../state/thunk';
import { thunkGetUser } from '../../state/auth/thunks';
import { RootState } from '../../state';
import PrivateRoute from '../../components/privateRoute';
import Layout from '../../layouts';
import { isSSR } from '../../utils/checkSSR';
import { UserFieldsFragment } from '../../lib/generated/datamodel';
import { isLoggedIn } from '../../state/auth/getters';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AccountPageDataType extends PageProps {}

const AccountPage = (args: AccountPageDataType) => {
  const user = isSSR
    ? undefined
    : useSelector<RootState, UserFieldsFragment | undefined>(
        (state) => state.authReducer.user
      );
  if (!isSSR) {
    const dispatchAuthThunk = useDispatch<AppThunkDispatch<AuthActionTypes>>();
    if (!user && isLoggedIn()) {
      dispatchAuthThunk(thunkGetUser()).catch((err: Error) =>
        console.error(err.message)
      );
    }
  }
  return (
    <PrivateRoute>
      <Layout location={args.location}>
        <SEO title="Account" />
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
    </PrivateRoute>
  );
};

export default AccountPage;
