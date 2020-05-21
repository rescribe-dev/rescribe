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
import { isSSR } from '../../utils/checkSSR';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AccountPageDataType {}

declare global {
  interface Window {
    grecaptcha: any;
  }
}

const AccountPage = (_args: PageProps<AccountPageDataType>) => {
  let user: UserType | undefined = undefined;
  if (!isSSR) {
    user = useSelector<RootState, UserType | undefined>(
      (state) => state.authReducer.user
    );
    if (!user) {
      const dispatchAuthThunk = useDispatch<
        AppThunkDispatch<AuthActionTypes>
      >();
      dispatchAuthThunk(thunkGetUser());
    }
  }
  return (
    <>
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
    </>
  );
};

export default AccountPage;
