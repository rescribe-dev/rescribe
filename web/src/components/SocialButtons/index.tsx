import React from 'react';
import { toast } from 'react-toastify';
import { Container, Button } from 'reactstrap';
import { navigate } from 'gatsby';
import { AiFillGithub } from 'react-icons/ai';

interface SocialButtonsArgs {
  signUp: boolean;
}

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
            // navigate to github sign-in
            navigate(
              `https://github.com/login/oauth/authorize?client_id=${process.env.GATSBY_GITHUB_CLIENT_ID}`
            );
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
