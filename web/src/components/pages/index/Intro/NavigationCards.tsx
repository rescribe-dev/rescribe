import React from 'react';
import { CardDeck, Container } from 'reactstrap';
import { FluidObject } from 'gatsby-image';
import { useStaticQuery, graphql, Link } from 'gatsby';
import NavigationCard from './NavigationCard';

interface ImageObj {
  childImageSharp: {
    fluid: FluidObject;
  };
}

interface QueryData {
  image1: ImageObj;
  image2: ImageObj;
  image3: ImageObj;
}

const NavigationCards = (): JSX.Element => {
  const data = useStaticQuery<QueryData>(
    graphql`
      fragment image on File {
        childImageSharp {
          fluid(maxWidth: 200) {
            ...GatsbyImageSharpFluid
          }
        }
      }
      query {
        image1: file(relativePath: { eq: "home/navigationCards/image1.png" }) {
          ...image
        }
        image2: file(relativePath: { eq: "home/navigationCards/image2.png" }) {
          ...image
        }
        image3: file(relativePath: { eq: "home/navigationCards/image3.png" }) {
          ...image
        }
      }
    `
  );
  return (
    <Container>
      <CardDeck>
        <NavigationCard
          image={data.image1.childImageSharp.fluid}
          title="Intuitive Search"
        >
          Use the interface you{"'"}re used to. Either on our website or within
          a supported IDE, type in a natural search query and let us do the
          heavy lifting. We{"'"}ll comb through all indexed public repositories
          (all all of the repositories you{"'"}ve indexed yourself) to find you
          the most relevant pieces of source code and their locations, so you
          can get back to doing what you do best.
        </NavigationCard>
        <NavigationCard
          image={data.image2.childImageSharp.fluid}
          title="Write better code"
        >
          Organization and maintainability is at the core of what we are trying
          to offer developers. ReScribe will organize your code base and make it
          easily searchable by you and your partners, and bring the open source
          community to you in an entirely new way. With a single search, you
          {"'"}ll be able to insert reusable and relevant code snippets directly
          into your project.
        </NavigationCard>
        <NavigationCard
          image={data.image3.childImageSharp.fluid}
          title="Extendable"
        >
          We built reScribe on a GraphQL API which you can directly interface
          with for use within your own projects. You can find it at{' '}
          <Link target="_blank" to="https://api.rescribe.dev/graphql">
            api.rescribe.dev/graphql
          </Link>
          . reScribe is for developers, by developers.
        </NavigationCard>
      </CardDeck>
    </Container>
  );
};

export default NavigationCards;
