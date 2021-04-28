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
import { client } from 'utils/apollo';
import { thunkLogout } from 'state/auth/thunks';
import {
  DeleteAccount,
  DeleteAccountMutation,
  DeleteAccountMutationVariables,
} from 'lib/generated/datamodel';

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
          className="mr-2"
          onClick={(evt) => {
            evt.preventDefault();
            navigate('/settings/tokens');
          }}
        >
          Tokens
        </Button>
        <Button
          color="danger"
          onClick={async (evt) => {
            evt.preventDefault();
            try {
              const deleteAccountRes = await client.mutate<
                DeleteAccountMutation,
                DeleteAccountMutationVariables
              >({
                mutation: DeleteAccount,
                variables: {},
              });
              if (deleteAccountRes.errors) {
                throw new Error(deleteAccountRes.errors.join(', '));
              }
              toast('Deleted Account!', {
                type: 'success',
              });
              if (!dispatchAuthThunk) {
                navigate('/signup');
              } else {
                await dispatchAuthThunk(thunkLogout());
              }
            } catch (err) {
              const errObj = err as Error;
              toast(errObj.message, {
                type: 'error',
              });
            }
          }}
        >
          Delete Account
        </Button>
      </div>
    </Container>
  );
};

export default SettingsPage;
