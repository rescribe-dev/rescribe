import React from 'react';
import {
  Container,
  Jumbotron,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
  CardImg,
} from 'reactstrap';
import { useStaticQuery, graphql, Link } from 'gatsby';
import Img, { FluidObject } from 'gatsby-image';
import { StyleSheet, css } from 'aphrodite';

interface QueryData {
  searchResult: {
    childImageSharp: {
      fluid: FluidObject;
    };
  };
}

const styles = StyleSheet.create({
  colors: {
    '.light': {
      '--bg-image-color': 'var(--soft-background)',
      '--bg-card-color': 'white',
    },
    '.dark': {
      'bg-image-color': 'var(--gray5)',
      '--bg-card-color': 'var(--gray6)',
    },
  },
});

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
      className={'text-center' + css(styles.colors)}
      style={{
        margin: 0,
        paddingTop: '5rem',
        borderRadius: 0,
        backgroundColor: 'var(--bg-how-to-use)',
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
            marginBottom: '3rem',
            marginTop: '2rem',
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
            <Col lg="8" style={{ textAlign: 'left' }}>
              <p>
                Simply input a search query and we will exhaustively search
                through all of our indexed repositories. We will then return
                pure source code along with meta information on where to find
                its parent file and project. After that, you simply copy and
                paste into your own project (and if you{"'"}re in a supported
                IDE we will do that for you). You don{"'"}t have to reinvent the
                wheel every time you sit down to develop, reScribe saves you
                time and money searching for source code!
              </p>
            </Col>
          </Row>
          <Row className="justify-content-center mt-4">
            <Col lg="8">
              <Card
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  maxWidth: '50rem',
                }}
              >
                <CardImg
                  top
                  width="100%"
                  tag={Img}
                  fluid={data.searchResult.childImageSharp.fluid}
                  alt="search result"
                />
                <CardBody className="px-0">
                  <CardTitle style={{ marginBottom: '1rem' }}>
                    <b>Search Result</b>
                  </CardTitle>
                  <CardText>
                    We return the location, owner, language, structure, and
                    contents of a snippet of cource code. As you can see from
                    this example, loginlocal is a function belonging to the
                    class {'"'}
                    ClassName.{'"'} It is located within the file api/login.go
                    within user jschmidtnj{"'"}s repository {'"'}
                    reScribe.{'"'}
                    Every Search Result starts with a preview of the first and
                    last few lines of every result. This view can be expanded to
                    show the entire result at once, and we include a {'"'}copy
                    all{'"'}
                    convenience button. Last, we include a button to show more
                    Search Results. reScribe is for developers, by developers.
                    That means saving you the maximum amount of time possible,
                    and providing you with as much information as possible.
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
