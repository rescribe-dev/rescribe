import React from 'react';
import { Row, Button, Col, Container } from 'reactstrap';
import './index.scss';

interface popResArgs {
  url: string;
  code: string;
  lang: string;
  selected: boolean;
}
const PopRes = (args: popResArgs): JSX.Element => {
  return (
    <Container>
      <Row>
        <a href={args.url}>{args.url}</a>
        <p>{args.lang}</p>
      </Row>
      <Row>
        <p>{args.code}</p>
      </Row>
      <Row>
        <Col>
          <Button variant="secondary">Copy</Button>
          <Button variant="Light">Download</Button>
        </Col>
      </Row>
    </Container>
  );
};

export default PopRes;
