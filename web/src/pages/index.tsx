import React from 'react';
import { Container } from 'reactstrap';
import SearchBar from '../components/index/SearchBar';
import Layout from '../layouts/index';
import SEO from '../components/seo';
import './index.scss';
import { isSSR } from '../utils/checkSSR';
import { useQuery } from '@apollo/react-hooks';
import { HelloQuery, Hello } from '../lib/generated/datamodel';
// import NavCard from '../components/naviagtionCard';
import { graphql, PageProps } from 'gatsby';
import { FixedObject } from 'gatsby-image';
import Newsletter from '../components/index/Newsletter';

interface IndexPageProps extends PageProps {
  data: {
    file: {
      childImageSharp: {
        fixed: FixedObject;
      };
    };
  };
}

const IndexPage = (args: IndexPageProps) => {
  if (!isSSR) {
    console.log(useQuery<HelloQuery | undefined>(Hello).data?.hello);
  }
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
