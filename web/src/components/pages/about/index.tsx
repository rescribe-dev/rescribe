import React from 'react';
import { Container } from 'reactstrap';
import './index.scss';
import { PageProps } from 'gatsby';
import { AboutMessages } from 'locale/pages/about/aboutMessages';

export interface AboutPageProps extends PageProps {
  data: Record<string, unknown>;
}

interface AboutPageContentProps extends AboutPageProps {
  messages: AboutMessages;
}

const AboutPage = (_args: AboutPageContentProps): JSX.Element => {
  return (
    <>
      <Container>
        <p>about page</p>
      </Container>
    </>
  );
};

export default AboutPage;
