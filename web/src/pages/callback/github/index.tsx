import React, { useEffect } from 'react';
import SEO from 'components/seo';
import { PageProps, navigate } from 'gatsby';
import { toast } from 'react-toastify';
import { getOauthToken, getUsername } from 'state/auth/getters';
import { thunkLoginGithub, thunkGetUser } from 'state/auth/thunks';
import { useDispatch } from 'react-redux';
import { AuthActionTypes } from 'state/auth/types';
import { AppThunkDispatch } from 'state/thunk';
import { isSSR } from 'utils/checkSSR';
import { initializeApolloClient, client } from 'utils/apollo';
import { ApolloError } from 'apollo-client';
import {
  RegisterGithubMutation,
  RegisterGithubMutationVariables,
  RegisterGithub,
} from 'lib/generated/datamodel';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CallbackPageDataProps extends PageProps {}

const CallbackPage = (args: CallbackPageDataProps): JSX.Element => {
  let dispatchAuthThunk: AppThunkDispatch<AuthActionTypes>;
  if (!isSSR) {
    dispatchAuthThunk = useDispatch<AppThunkDispatch<AuthActionTypes>>();
  }
  useEffect(() => {
    try {
      if (args.location.search.length > 0) {
        const searchParams = new URLSearchParams(args.location.search);
        if (searchParams.has('error')) {
          let message = searchParams.get('error_description');
          if (!message) {
            message = searchParams.get('error') as string;
          }
          throw new Error('GitHub Oauth Error: ' + message);
        }
        if (!searchParams.has('type')) {
          throw new Error('no callback type found');
        }
        const state = searchParams.get('state');
        if (state !== getOauthToken()) {
          throw new Error('invalid state provided');
        }
        if (!searchParams.has('code')) {
          throw new Error('cannot find code from github callback');
        }
        const code = searchParams.get('code') as string;
        const callbackType = searchParams.get('type') as string;
        if (callbackType === 'signup') {
          client
            .mutate<RegisterGithubMutation, RegisterGithubMutationVariables>({
              mutation: RegisterGithub,
              variables: {
                code,
                state,
              },
            })
            .then(() => {
              navigate('/login');
            })
            .catch((err) => {
              toast((err as ApolloError).message, {
                type: 'error',
              });
              navigate('/signup');
            });
        } else if (callbackType === 'login') {
          dispatchAuthThunk(
            thunkLoginGithub({
              code,
              state,
            })
          )
            .then(async () => {
              try {
                await initializeApolloClient();
                await dispatchAuthThunk(thunkGetUser());
                const username = getUsername();
                if (username.length > 0) {
                  navigate(`/${username}`);
                } else {
                  navigate('/account');
                }
              } catch (err) {
                toast((err as Error).message, {
                  type: 'error',
                });
              }
            })
            .catch((err) => {
              toast((err as Error).message, {
                type: 'error',
              });
              navigate('/signup');
            });
        } else {
          throw new Error('invalid type found');
        }
      } else {
        throw new Error('no search params found');
      }
    } catch (err) {
      toast((err as Error).message, {
        type: 'error',
      });
      navigate('/signup');
    }
  }, []);
  return (
    <>
      <SEO title="Callback" />
    </>
  );
};

export default CallbackPage;
// https://rescribe.dev/callback?code=ee7ae09e03941163ab19
