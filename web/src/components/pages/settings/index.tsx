import React, { useEffect } from 'react';
import { Container, Button } from 'reactstrap';
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
import { toast } from 'react-toastify';
import { SettingsMessages } from 'locale/pages/settings/settingsMessages';
import { navigate } from '@reach/router';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SettingsPageDataProps extends PageProps {}

interface SettingsProps extends SettingsPageDataProps {
  messages: SettingsMessages;
}
const SettingsPage = (_args: SettingsProps): JSX.Element => {
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
    <Container>
      <div>
        {user === undefined ? (
          <div>loading</div>
        ) : (
          <div>
            <p>{JSON.stringify(user)}</p>
          </div>
        )}
        <Button
          onClick={(evt) => {
            evt.preventDefault();
            navigate('/settings/tokens');
          }}
        >
          Tokens
        </Button>
      </div>
    </Container>
  );
};

export default SettingsPage;
