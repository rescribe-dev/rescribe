import React, { useEffect } from 'react';
import { Container } from 'reactstrap';
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
import { PageProps, navigate } from 'gatsby';
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
      <Container className="default-container">
        <SearchBar />
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
