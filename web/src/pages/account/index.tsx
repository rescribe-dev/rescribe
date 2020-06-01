import React from 'react';
import { Container } from 'reactstrap';
import { PageProps } from 'gatsby';

import './index.scss';

import SEO from '../../components/seo';
import { useDispatch, useSelector } from 'react-redux';
import { AuthActionTypes, UserType } from '../../state/auth/types';
import { AppThunkDispatch } from '../../state/thunk';
import { thunkGetUser } from '../../state/auth/thunks';
import { RootState } from '../../state';
import PrivateRoute from '../../components/privateRoute';
import Layout from '../../layouts';
import { isSSR } from '../../utils/checkSSR';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AccountPageDataType {}

const AccountPage = (_args: PageProps<AccountPageDataType>) => {
  const user = isSSR
    ? undefined
    : useSelector<RootState, UserType | undefined>(
        (state) => state.authReducer.user
      );
  if (!isSSR && !user) {
    const dispatchAuthThunk = useDispatch<AppThunkDispatch<AuthActionTypes>>();
    dispatchAuthThunk(thunkGetUser()).catch((err: Error) =>
      console.error(err.message)
    );
  }
  return (
    <PrivateRoute>
      <Layout>
        <SEO title="Account" />
        <Container
          style={{
            marginTop: '3rem',
            marginBottom: '5rem',
          }}
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
    </PrivateRoute>
  );
};

export default AccountPage;
