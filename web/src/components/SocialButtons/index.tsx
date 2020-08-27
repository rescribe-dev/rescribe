import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Container, Button } from 'reactstrap';
import { AiFillGithub } from 'react-icons/ai';
import { githubOauthURL } from 'utils/variables';
import { getOauthToken } from 'state/auth/getters';
import { store } from 'state/reduxWrapper';
import { generateOauthID } from 'state/auth/actions';
import { WindowLocation } from '@reach/router';

interface SocialButtonsArgs {
  signUp: boolean;
  location: WindowLocation | string;
}

const githubScopes = ['read:user', 'user:email'];

const SocialButtons = (args: SocialButtonsArgs): JSX.Element => {
  const actionMessage = args.signUp ? 'Sign Up' : 'Login';
  const [token, setLocalToken] = useState<string | null>(null);
  const [redirect, setRedirect] = useState<string | null>(null);
  const [cliLogin, setCliLogin] = useState<boolean>(false);
  const [vscodeLogin, setVSCodeLogin] = useState<boolean>(false);
  useEffect(() => {
    let searchString: string;
    if (typeof args.location === 'string') {
      const queryLocation = args.location.indexOf('?');
      if (queryLocation < 0) {
        searchString = '';
      } else {
        searchString = args.location.substring(queryLocation);
      }
    } else {
      searchString = args.location.search;
    }
    if (searchString.length > 0) {
      const searchParams = new URLSearchParams(searchString);
      if (!args.signUp) {
        if (searchParams.has('token')) {
          setLocalToken(searchParams.get('token') as string);
        }
        if (searchParams.has('redirect')) {
          setRedirect(
            decodeURIComponent(searchParams.get('redirect') as string)
          );
        }
        if (searchParams.has('cli')) {
          setCliLogin(true);
        } else if (searchParams.has('vscode')) {
          setVSCodeLogin(true);
        }
      }
    }
  }, []);
  return (
    <Container className="p-0">
      <Button
        style={{
          backgroundColor: '#211F1F',
          width: '100%',
        }}
        onClick={(evt) => {
          evt.preventDefault();
          try {
            if (!process.env.GATSBY_GITHUB_CLIENT_ID) {
              throw new Error('cannot find github client id in environment');
            }
            const githubURL = new URL(githubOauthURL);
            githubURL.searchParams.append(
              'client_id',
              process.env.GATSBY_GITHUB_CLIENT_ID
            );
            if (githubScopes.length > 0) {
              githubURL.searchParams.append('scope', githubScopes.join(' '));
            }
            if (getOauthToken().length === 0) {
              store.dispatch(generateOauthID());
            }
            githubURL.searchParams.append('state', getOauthToken());
            const callbackURL = new URL(
              process.env.GATSBY_SITE_URL + '/callback/github'
            );
            if (!args.signUp) {
              if (token) {
                callbackURL.searchParams.append('token', token);
              }
              if (cliLogin) {
                callbackURL.searchParams.append('cli', '');
              }
              if (vscodeLogin) {
                callbackURL.searchParams.append('vscode', '');
              }
              if (redirect !== null) {
                callbackURL.searchParams.append('redirect', redirect);
              }
            }
            callbackURL.searchParams.append(
              'type',
              args.signUp ? 'signup' : 'login'
            );
            githubURL.searchParams.append(
              'redirect_uri',
              callbackURL.toString()
            );
            window.location.href = githubURL.toString();
          } catch (err) {
            toast((err as Error).message, {
              type: 'error',
            });
          }
        }}
      >
        <AiFillGithub size="2rem" /> {actionMessage} with GitHub
      </Button>
    </Container>
  );
};

export default SocialButtons;
