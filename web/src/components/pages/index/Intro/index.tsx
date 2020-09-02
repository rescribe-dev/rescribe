import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import './index.scss';
import { IndexMessages } from 'locale/pages/index/indexMessages';
import Companies from './Companies';
import NavigationCards from './NavigationCards';

const Intro = (_messages: IndexMessages): JSX.Element => {
  return (
    <>
      <Container className="text-center">
        <h2
          style={{
            color: 'var(--secondary-header)',
            marginBottom: '2rem',
          }}
        >
          The world of code at your fingertips
        </h2>
        <Row className="justify-content-center">
          <Col lg="5">
            <p>
              reScribe puts the power of the open source community at your
              fingertips. It provides an innovative way to search code from
              across the internet.
            </p>
          </Col>
        </Row>
        <Companies />
        <Row
          style={{
            marginTop: '2rem',
          }}
          className="justify-content-center"
        >
          <Col lg="7">
            <p>
              Code can be indexed using our API, CLI, and soon our website. It
              can be retrieved using our API, website, and our VSCode Extension.
            </p>
          </Col>
        </Row>
      </Container>
      <Container
        style={{
          marginTop: '2rem',
        }}
      >
        <NavigationCards />
      </Container>
    </>
  );
};

export default Intro;
