import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Container, Button } from 'reactstrap';
import { navigate } from 'gatsby';
import { AiFillGithub } from 'react-icons/ai';
import { githubOauthURL } from 'utils/variables';
import { getOauthToken } from 'state/auth/getters';
import { store } from 'state/reduxWrapper';
import { generateOauthID } from 'state/auth/actions';
import { WindowLocation } from '@reach/router';

interface SocialButtonsArgs {
  signUp: boolean;
  location: WindowLocation;
}

const githubScopes = ['read:user'];

const SocialButtons = (args: SocialButtonsArgs): JSX.Element => {
  const actionMessage = args.signUp ? 'Sign Up' : 'Login';
  const [token, setLocalToken] = useState<string | null>(null);
  const [redirect, setRedirect] = useState<string | null>(null);
  const [cliLogin, setCliLogin] = useState<boolean>(false);
  const [vscodeLogin, setVSCodeLogin] = useState<boolean>(false);
  useEffect(() => {
    if (args.location.search.length > 0) {
      const searchParams = new URLSearchParams(args.location.search);
      if (!args.signUp) {
        if (searchParams.has('token')) {
          setLocalToken(searchParams.get('token') as string);
        }
        if (searchParams.has('redirect')) {
          setRedirect(searchParams.get('redirect') as string);
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
            navigate(githubURL.toString());
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
