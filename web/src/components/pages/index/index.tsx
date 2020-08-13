import React, { useEffect } from 'react';
import { Container, Jumbotron, Row, Col } from 'reactstrap';
import SearchBar from './SearchBar';
import './index.scss';
import { isSSR } from 'utils/checkSSR';
import { useQuery } from '@apollo/react-hooks';
import {
  HelloQuery,
  Hello,
  VerifyEmailMutation,
  VerifyEmailMutationVariables,
  VerifyEmail,
} from 'lib/generated/datamodel';
// import NavCard from 'components/pages/NaviagtionCard';
import { PageProps, navigate, Link } from 'gatsby';
import Newsletter from './Newsletter';
import { client } from 'utils/apollo';
import { toast } from 'react-toastify';
import { IndexMessages } from 'locale/pages/index/indexMessages';
import { Helmet } from 'react-helmet-async';

export interface IndexPageProps extends PageProps {
  data: Record<string, unknown>;
}

interface IndexPageContentProps extends IndexPageProps {
  messages: IndexMessages;
}

const IndexPage = (args: IndexPageContentProps): JSX.Element => {
  if (!isSSR) {
    console.log(useQuery<HelloQuery | undefined>(Hello).data?.hello);
  }
  useEffect(() => {
    let verifyEmail = false;
    let newsletterToken: string | undefined = undefined;
    if (args.location.search.length > 0) {
      const searchParams = new URLSearchParams(args.location.search);
      if (searchParams.has('token')) {
        newsletterToken = searchParams.get('token') as string;
      }
      if (searchParams.has('verify_newsletter')) {
        verifyEmail = true;
      }
    }
    if (verifyEmail && newsletterToken !== undefined) {
      client
        .mutate<VerifyEmailMutation, VerifyEmailMutationVariables>({
          mutation: VerifyEmail,
          variables: {
            token: newsletterToken,
          },
        })
        .then((res) => {
          let message = res.data?.verifyEmail;
          if (!message) {
            message = 'email successfully verified for newsletter';
          }
          toast(message, {
            type: 'success',
          });
          navigate('/');
        })
        .catch((err) => {
          toast(err.message, {
            type: 'error',
          });
          return;
        });
    }
  }, []);
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
      <Container
        className="text-center"
        style={{
          marginTop: '2rem',
        }}
      >
        <h2
          style={{
            color: 'var(--secondary-header)',
            marginBottom: '2rem',
          }}
        >
          A world of code at your fingertips
        </h2>
        <Row className="justify-content-center">
          <Col lg="5">
            <p>
              reScribe puts the power of the open source community at your
              fingertips. It provides an innovative way to search through code
              from across the internet.
            </p>
          </Col>
        </Row>
      </Container>
      <Container>
        {/*<NavCard
            title="Intuitive search"
            subtitle="optional subtitle"
            image={args.data.file.childImageSharp.fixed}
            body={'text'}
            linkText="read more"
            linkSlug="/"
          />*/}
      </Container>
      <Newsletter />
    </>
  );
};

export default IndexPage;
