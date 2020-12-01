import React from 'react';;
import { Col, Container, Row } from 'reactstrap';
import './index.scss';
import { PageProps } from 'gatsby';
import { ExploreMessages } from 'locale/pages/explore/exploreMessages';
import Description from './description';
import logoBlack from 'assets/images/logo-black.svg';

export interface ExplorePageProps extends PageProps {
  data: Record<string, unknown>;
}

interface ExplorePageContentProps extends ExplorePageProps {
  messages: ExploreMessages;
}

const ExplorePage = (_args: ExplorePageContentProps): JSX.Element => {
  return (
    <>
      <Container>
        <>
          <Col>
            <Row>
              <h3>Popular Results</h3>
            </Row>
            <Row>
              {/* Insert the search results for the most popular queries here */}

            </Row>
          </Col>
        </>
        <>
          <Col>
            <Row>
              <Description repository={'asdf123'} source={'https://apple.com'} description={'asdflkdsaf;ljkfd  lkasdjkfsdlk asdflkasjkl'} />
              {/* 
                Insert the Description component for the code snippet, this will probably amount to a segment
                from the readme when we get it, but for now we just just have it be the link to the source of the selected code
              */}
            </Row>
            <Row>
              <Col className="text-center"> 
                <img
                  src={logoBlack}
                  alt="reScribe"
                  style={{
                    width: '9rem',
                    marginBottom: 0,
                  }}
                />
              </Col>
            </Row>
          </Col>
        </>
      </Container>
    </>
  );
};

export default ExplorePage;
