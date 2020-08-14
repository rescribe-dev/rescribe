import React from 'react';
import './index.scss';
import {
  Container,
  Jumbotron,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
} from 'reactstrap';
import { useStaticQuery, graphql, Link } from 'gatsby';
import Img, { FluidObject } from 'gatsby-image';

interface QueryData {
  searchResult: {
    childImageSharp: {
      fluid: FluidObject;
    };
  };
}

const HowToUse = (): JSX.Element => {
  const data = useStaticQuery<QueryData>(
    graphql`
      query {
        searchResult: file(relativePath: { eq: "home/searchResult.png" }) {
          childImageSharp {
            fluid(maxWidth: 1000) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    `
  );
  return (
    <Jumbotron
      className="text-center"
      style={{
        margin: 0,
        paddingTop: '5rem',
        borderRadius: 0,
        backgroundColor: 'var(--gray1)',
        clipPath: 'polygon(100% 0%, 0% 10%, 0% 100%, 100% 100%)',
      }}
    >
      <Container
        style={{
          padding: 0,
        }}
      >
        <h2
          style={{
            color: 'var(--secondary-header)',
            marginBottom: '2rem',
          }}
        >
          How to use reScribe
        </h2>
        <Container
          style={{
            marginBottom: '1rem',
          }}
        >
          <Row className="justify-content-center">
            <Col lg="6">
              <p>
                Simply search for code in any repository, find the lines of code
                you need. Now you can copy and paste into your own project.
                Reusing code will save you lots of time and money.
              </p>
            </Col>
          </Row>
        </Container>
        <Container>
          <Row>
            <Col>
              <Img
                fluid={data.searchResult.childImageSharp.fluid}
                alt="search result"
              />
            </Col>
            <Col sm="4">
              <Card
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                }}
              >
                <CardBody>
                  <CardTitle>
                    <b>Search Result</b>
                  </CardTitle>
                  <CardText>
                    Integer malesuada dolor sed arcu faucibus, a rhoncus turpis
                    volutpat. Integer congue nisl eu congue gravida. Cras non
                    viverra velit.
                  </CardText>
                  <CardText className="remove-underlines">
                    <Link to="/start">Get Started {'>'}</Link>
                  </CardText>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </Container>
    </Jumbotron>
  );
};

export default HowToUse;
