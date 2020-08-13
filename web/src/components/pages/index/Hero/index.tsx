import React from 'react';
import { Container, Jumbotron, Row, Col } from 'reactstrap';
import './index.scss';
import { Link } from 'gatsby';
import { IndexMessages } from 'locale/pages/index/indexMessages';
import SearchBar from './SearchBar';
import { Helmet } from 'react-helmet-async';

const Hero = (_messages: IndexMessages): JSX.Element => {
  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "${process.env.GATSBY_SITE_URL}",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "${process.env.GATSBY_SITE_URL}/search?q={query}",
                "query-input": "required name=query"
              }
            }
          `}
        </script>
      </Helmet>
      <Jumbotron
        className="text-center"
        style={{
          margin: 0,
          minHeight: '30rem',
          borderRadius: 0,
          color: 'white',
          clipPath: 'polygon(100% 0%, 0% 0%, 0% 100%, 100% 90%)',
          background:
            'linear-gradient(180deg, var(--purple-blue) 0%, var(--turquoise) 100%)',
        }}
      >
        <Container
          style={{
            padding: 0,
          }}
        >
          <h1
            className="display-4"
            style={{
              margin: '2rem',
            }}
          >
            reScribe
          </h1>
          <Container
            style={{
              marginBottom: '1rem',
            }}
          >
            <Row className="justify-content-center">
              <Col lg="7">
                <p className="lead">
                  allows you to search code within all languages and
                  repositories. Imagine how much faster you can code.
                </p>
              </Col>
            </Row>
          </Container>
          <Container>
            <Row className="justify-content-center">
              <Col lg="10" className="remove-underlines">
                <SearchBar />
                <Link
                  style={{
                    color: 'white',
                  }}
                  to="/search"
                >
                  Advanced Search {'>'}
                </Link>
              </Col>
            </Row>
          </Container>
        </Container>
      </Jumbotron>
    </>
  );
};

export default Hero;
