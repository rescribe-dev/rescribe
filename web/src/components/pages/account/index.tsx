import React, { useEffect } from 'react';
import { Container } from 'reactstrap';
import { PageProps } from 'gatsby';

import './index.scss';

import { useDispatch, useSelector } from 'react-redux';
import { AuthActionTypes } from 'state/auth/types';
import { AppThunkDispatch } from 'state/thunk';
import { thunkGetUser } from 'state/auth/thunks';
import { RootState } from 'state';
import { isSSR } from 'utils/checkSSR';
import { UserFieldsFragment } from 'lib/generated/datamodel';
import { isLoggedIn } from 'state/auth/getters';
import { AccountMessages } from 'locale/pages/account/accountMessages';
import { toast } from 'react-toastify';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AccountPageDataProps extends PageProps {}

interface AccountProps extends AccountPageDataProps {
  messages: AccountMessages;
}

const AccountPage = (_args: AccountProps): JSX.Element => {
  const user = isSSR
    ? undefined
    : useSelector<RootState, UserFieldsFragment | undefined>(
        (state) => state.authReducer.user
      );
  const dispatchAuthThunk = isSSR
    ? undefined
    : useDispatch<AppThunkDispatch<AuthActionTypes>>();
  useEffect(() => {
    (async () => {
      if (dispatchAuthThunk && !user && (await isLoggedIn())) {
        try {
          await dispatchAuthThunk(thunkGetUser());
        } catch (err) {
          const errObj = err as Error;
          toast(errObj.message, {
            type: 'error',
          });
        }
      }
    })();
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

export default AccountPage;
