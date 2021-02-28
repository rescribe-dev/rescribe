import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import './index.scss';
import { PageProps } from 'gatsby';
import { StartMessages } from 'locale/pages/start/startMessages';
import vscode from 'assets/images/start/vscode.png';
import github from 'assets/images/start/github.png';
import cli from 'assets/images/start/cli.png';

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
                {
                  'Introduction about reScribe "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis'
                }
              </p>
            </Row>
            <Row>
              <h3>VSCode Extension:</h3>
              <a
                style={{
                  color: '#0275D8',
                  paddingLeft: '0.25rem',
                }}
                className="align-self-center"
                href="https://vscode.rescribe.dev"
              >
                Download here
              </a>
            </Row>
            <Row>
              <p>
                {
                  'Our VSCode extension can be used to pull code snippets from anywhere on your machine or the internet directly into your project. Instructions on how to use the extension, ex> ctrl+shift+p brings up the command palette yadda yadda'
                }
              </p>
            </Row>
            <Row
              style={{
                paddingBottom: '3rem',
              }}
            >
              <img src={vscode} alt="VSCode Extension Image" />
            </Row>
            <Row>
              <h3>Github App:</h3>
              <a
                style={{
                  color: '#0275D8',
                  paddingLeft: '0.25rem',
                }}
                className="align-self-center"
                href="https://github.rescribe.dev"
              >
                Download here
              </a>
            </Row>
            <Row>
              <p>
                {
                  'Our GitHub app provides you with seamless intrgration with github, allowing you to quickly index new and existing repostiories. Simply follow the download link above, install the app to your account, and then allow access to the repositories you want to track with rescribe. yadda yadda'
                }
              </p>
            </Row>
            <Row
              style={{
                paddingBottom: '3rem',
              }}
            >
              <img src={github} alt="Github App Image" />
            </Row>
            <Row>
              <h3>CLI:</h3>
              <a
                style={{
                  color: '#0275D8',
                  paddingLeft: '0.25rem',
                }}
                className="align-self-center"
                href="https://cli.rescribe.dev"
              >
                Download here
              </a>
            </Row>
            <Row>
              <p>
                {
                  'Our CLI allows you to quickly index and organize any folder or project you come across. Built in NodeJS and available via NPM! Instructions on some of the basic commands in the CLI'
                }
              </p>
            </Row>
            <Row
              style={{
                paddingBottom: '3rem',
              }}
            >
              <img src={cli} alt="CLI Image" />
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default StartPage;
