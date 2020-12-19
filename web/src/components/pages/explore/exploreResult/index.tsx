import { ExploreResultType } from 'locale/pages/explore/exploreMessages';
import React from 'react';
import { Row, Button, Col, Container } from 'reactstrap';
import './index.scss';

// interface ExploreResultArgs {
//   result: ExploreResultType;
// };

const ExploreResultComponent = (args: ExploreResultType): JSX.Element => {
  return (
    <Container>
      <Row>
        <a href={args.repoUrl}>{args.repoUrl}</a>
        <p>{args.repoLang}</p>
      </Row>
      <Row>
        <p>{args.repoCode}</p>
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

export default ExploreResultComponent;
