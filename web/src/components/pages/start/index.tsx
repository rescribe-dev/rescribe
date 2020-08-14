import React from 'react';
import { Container } from 'reactstrap';
import './index.scss';
import { PageProps } from 'gatsby';
import { StartMessages } from 'locale/pages/start/startMessages';

export interface StartPageProps extends PageProps {
  data: Record<string, unknown>;
}

interface StartPageContentProps extends StartPageProps {
  messages: StartMessages;
}

const StartPage = (_args: StartPageContentProps): JSX.Element => {
  return (
    <>
      <Container>
        <p>start page</p>
      </Container>
    </>
  );
};

export default StartPage;
