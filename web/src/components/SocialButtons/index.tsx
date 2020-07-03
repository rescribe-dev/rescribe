import React from 'react';
import { toast } from 'react-toastify';
import { Container, Button } from 'reactstrap';
import { navigate } from 'gatsby';
import { AiFillGithub } from 'react-icons/ai';
import { githubOauthURL } from 'utils/variables';
import { getOauthToken } from 'state/auth/getters';
import { store } from 'state/reduxWrapper';
import { generateOauthID } from 'state/auth/actions';

interface SocialButtonsArgs {
  signUp: boolean;
}

const githubScopes = ['read:user'];

const LoginPage = (args: SocialButtonsArgs): JSX.Element => {
  const actionMessage = args.signUp ? 'Sign Up' : 'Login';
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

export default LoginPage;
