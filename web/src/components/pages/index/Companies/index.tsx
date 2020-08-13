import React from 'react';
import { Container } from 'reactstrap';
import { FixedObject } from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';

interface NavCardArgs {
  title: string;
  subtitle?: string;
  body: string;
  image: FixedObject;
  linkText: string;
  linkSlug: string;
}

const Companies = (_args: NavCardArgs): JSX.Element => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            author
          }
        }
      }
    `
  );
  return <Container>{site}</Container>;
};

export default Companies;
