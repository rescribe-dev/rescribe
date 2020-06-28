import React, { useEffect } from 'react';
import { Container } from 'reactstrap';
import SearchBar from '../components/index/SearchBar';
import Layout from '../layouts/index';
import SEO from '../components/seo';
import './index.scss';
import { isSSR } from '../utils/checkSSR';
import { useQuery } from '@apollo/react-hooks';
import {
  HelloQuery,
  Hello,
  VerifyEmailMutation,
  VerifyEmailMutationVariables,
  VerifyEmail,
} from '../lib/generated/datamodel';
// import NavCard from '../components/naviagtionCard';
import { graphql, PageProps, navigate } from 'gatsby';
import { FixedObject } from 'gatsby-image';
import Newsletter from '../components/index/Newsletter';
import { client } from '../utils/apollo';
import { toast } from 'react-toastify';

interface IndexPageProps extends PageProps {
  data: {
    file: {
      childImageSharp: {
        fixed: FixedObject;
      };
    };
  };
}

const IndexPage = (args: IndexPageProps): JSX.Element => {
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
  // const loremText =
  //   'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ultricies porttitor ullamcorper. Lorem ipsum dolor sit amet, consectetur adipiscing elit';
  return (
    <Layout location={args.location}>
      <SEO title="Rescribe" />
      <Container className="default-container">
        <SearchBar />
        {/*<NavCard
            title="Intuitive search"
            subtitle="optional subtitle"
            image={args.data.file.childImageSharp.fixed}
            body={loremText}
            linkText="read more"
            linkSlug="/"
          />
          <NavCard
            title="Write Better Code"
            subtitle="optional subtitle"
            image={args.data.file.childImageSharp.fixed}
            body={loremText}
            linkText="read more"
            linkSlug="/"
          />
          <NavCard
            title="Extendable"
            subtitle="optional subtitle"
            image={args.data.file.childImageSharp.fixed}
            body={loremText}
            linkText="read more"
            linkSlug="/"
          />*/}
      </Container>
      <Newsletter />
    </Layout>
  );
};

export const imageData = graphql`
  {
    file(relativePath: { eq: "logo.png" }) {
      childImageSharp {
        fixed(width: 125, height: 125) {
          ...GatsbyImageSharpFixed
        }
      }
    }
  }
`;

export default IndexPage;
