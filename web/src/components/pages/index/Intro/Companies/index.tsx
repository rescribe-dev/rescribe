import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import Img, { FixedObject } from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';

interface ImageObj {
  childImageSharp: {
    fixed: FixedObject;
  };
}

interface QueryData {
  ibm: ImageObj;
  github: ImageObj;
  gitlab: ImageObj;
  react: ImageObj;
  stackoverflow: ImageObj;
}

const Companies = (): JSX.Element => {
  const data = useStaticQuery<QueryData>(
    graphql`
      query {
        ibm: file(relativePath: { eq: "companies/ibm.png" }) {
          childImageSharp {
            fixed(width: 50) {
              ...GatsbyImageSharpFixed
            }
          }
        }
        github: file(relativePath: { eq: "companies/github.png" }) {
          childImageSharp {
            fixed(width: 75) {
              ...GatsbyImageSharpFixed
            }
          }
        }
        gitlab: file(relativePath: { eq: "companies/gitlab.png" }) {
          childImageSharp {
            fixed(width: 75) {
              ...GatsbyImageSharpFixed
            }
          }
        }
        react: file(relativePath: { eq: "companies/react.png" }) {
          childImageSharp {
            fixed(width: 50) {
              ...GatsbyImageSharpFixed
            }
          }
        }
        stackoverflow: file(
          relativePath: { eq: "companies/stackoverflow.png" }
        ) {
          childImageSharp {
            fixed(width: 100) {
              ...GatsbyImageSharpFixed
            }
          }
        }
      }
    `
  );
  return (
    <Container>
      <Row className="justify-content-center">
        <Col sm={{ size: 'auto' }} className="my-auto">
          <Img fixed={data.ibm.childImageSharp.fixed} />
        </Col>
        <Col sm={{ size: 'auto' }} className="my-auto">
          <Img fixed={data.github.childImageSharp.fixed} />
        </Col>
        <Col sm={{ size: 'auto' }} className="my-auto">
          <Img fixed={data.gitlab.childImageSharp.fixed} />
        </Col>
        <Col sm={{ size: 'auto' }} className="my-auto">
          <Img fixed={data.react.childImageSharp.fixed} />
        </Col>
        <Col sm={{ size: 'auto' }} className="my-auto">
          <Img fixed={data.stackoverflow.childImageSharp.fixed} />
        </Col>
      </Row>
    </Container>
  );
};

export default Companies;
