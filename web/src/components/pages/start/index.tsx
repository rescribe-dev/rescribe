import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import Img, { FluidObject } from 'gatsby-image';
import './index.scss';
import { graphql, Link, PageProps, useStaticQuery } from 'gatsby';
import { StartMessages } from 'locale/pages/start/startMessages';

export interface StartPageProps extends PageProps {
  data: Record<string, unknown>;
}

interface StartPageContentProps extends StartPageProps {
  messages: StartMessages;
}

interface ImageObj {
  childImageSharp: {
    fluid: FluidObject;
  };
}

interface QueryData {
  vscode: ImageObj;
  github: ImageObj;
  cli: ImageObj;
}

const StartPage = (_args: StartPageContentProps): JSX.Element => {
  const [vscodeLink, setVscodeLink] = useState<string>('');
  const [githubLink, setGitHubLink] = useState<string>('');
  const [cliLink, setCliLink] = useState<string>('');
  useEffect(() => {
    if (!process.env.GATSBY_VSCODE_LINK) {
      throw new Error('cannot find vscode link');
    }
    setVscodeLink(process.env.GATSBY_VSCODE_LINK);
    if (!process.env.GATSBY_GITHUB_LINK) {
      throw new Error('cannot find github link');
    }
    setGitHubLink(process.env.GATSBY_GITHUB_LINK);
    if (!process.env.GATSBY_CLI_LINK) {
      throw new Error('cannot find cli link');
    }
    setCliLink(process.env.GATSBY_CLI_LINK);
  }, []);
  const imageData = useStaticQuery<QueryData>(
    graphql`
      query {
        vscode: file(relativePath: { eq: "getting_started/vscode.png" }) {
          childImageSharp {
            fluid(maxWidth: 2000, quality: 100) {
              ...GatsbyImageSharpFluid
            }
          }
        }
        github: file(relativePath: { eq: "getting_started/github.png" }) {
          childImageSharp {
            fluid(maxWidth: 2000, quality: 100) {
              ...GatsbyImageSharpFluid
            }
          }
        }
        cli: file(relativePath: { eq: "getting_started/cli.png" }) {
          childImageSharp {
            fluid(maxWidth: 2000, quality: 100) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    `
  );

  return (
    <>
      <Container
        style={{
          marginTop: '2rem',
        }}
      >
        <Row
          style={{
            marginTop: '2rem',
          }}
        >
          <Col>
            <h2>Getting Started</h2>
            <p>
              Introduction about reScribe Lorem ipsum dolor sit amet,
              consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
              labore et dolore magna aliqua. Ut enim ad minim veniam, quis
              nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
              consequat. Duis
            </p>
          </Col>
        </Row>
        <>
          <Row
            style={{
              marginTop: '2rem',
            }}
          >
            <Col>
              <h3>VSCode Extension</h3>
            </Col>
          </Row>
          <Row>
            <Col>
              <i>
                <Link to={vscodeLink}>Download Here</Link>
              </i>
            </Col>
          </Row>
          <Row>
            <Col>
              <p>
                Our VSCode extension can be used to pull code snippets from
                anywhere on your machine or the internet directly into your
                project. Instructions on how to use the extension, ex:
                ctrl+shift+p brings up the command palette yadda yadda
              </p>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col lg="8">
              <Img fluid={imageData.vscode.childImageSharp.fluid} />
            </Col>
          </Row>
        </>
        <>
          <Row
            style={{
              marginTop: '2rem',
            }}
          >
            <Col>
              <h3>GitHub Application</h3>
            </Col>
          </Row>
          <Row>
            <Col>
              <i>
                <Link to={githubLink}>Download Here</Link>
              </i>
            </Col>
          </Row>
          <Row>
            <Col>
              <p>
                Our GitHub app provides you with seamless intrgration with
                github, allowing you to quickly index new and existing
                repostiories. Simply follow the download link above, install the
                app to your account, and then allow access to the repositories
                you want to track with rescribe. yadda yadda
              </p>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col lg="8">
              <Img fluid={imageData.github.childImageSharp.fluid} />
            </Col>
          </Row>
        </>
        <>
          <Row
            style={{
              marginTop: '2rem',
            }}
          >
            <Col>
              <h3>Command Line Interface (CLI)</h3>
            </Col>
          </Row>
          <Row>
            <Col>
              <i>
                <Link to={cliLink}>Download Here</Link>
              </i>
            </Col>
          </Row>
          <Row>
            <Col>
              <p>
                Our CLI allows you to quickly index and organize any folder or
                project you come across. Built in NodeJS and available via NPM!
                below are some of the CLI commands we have availble
              </p>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col lg="8">
              <Img fluid={imageData.cli.childImageSharp.fluid} />
            </Col>
          </Row>
        </>
      </Container>
    </>
  );
};

export default StartPage;
