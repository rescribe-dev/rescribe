import React from 'react';
import Layout from 'layouts/index';
import SEO from 'components/seo';
import IndexContent, { IndexPageProps } from 'components/pages/index/index';
// import NavCard from 'components/pages/NaviagtionCard';
import { graphql } from 'gatsby';
import IndexMessagesEnglish from 'locale/pages/index/en';

const IndexPage = (args: IndexPageProps): JSX.Element => {
  return (
    <Layout location={args.location}>
      <SEO title="Rescribe" />
      <IndexContent {...args} messages={IndexMessagesEnglish} />
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
