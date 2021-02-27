import React from 'react';
import { Container, Row, Col } from 'reactstrap';
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
        <Row
          style={{
            paddingTop: '3rem',
          }}
        >
          <Col md={{ size: '8', offset: '2' }}>
            <Row>
              <h3>Getting Started</h3>
            </Row>
            <Row>
              <p
                style={{
                  paddingBottom: '1rem',
                }}
              >
                gfdgdfgfd
              </p>
            </Row>
            <Row>
              <h3>VSCode Extension: </h3>
              <a href="https://vscode.rescribe.dev">Download here</a>
            </Row>
            <Row>
              <p>dfgdfgdf</p>
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default StartPage;
