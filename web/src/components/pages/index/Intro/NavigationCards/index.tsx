import React from 'react';
import { CardDeck, Container } from 'reactstrap';
import { FluidObject } from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';
import NavigationCard from './NavigationCard';
import './index.scss';

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
          Lorem ipsum dolor sit amet,consectetur adipiscing elit. Sed ultricies
          porttitor ullamcorper. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit.
        </NavigationCard>
        <NavigationCard
          image={data.image2.childImageSharp.fluid}
          title="Write better code"
        >
          Sed mattis massa justo, non elementum turpis mattis eu. Integer
          malesuada dolor volutpat. Integer congue nisl eu congue gravida. Cras
          non viverra velit. Sed sodales nulla sapien. Fusce luctus felis sed
          nibh volutpat pharetra.
        </NavigationCard>
        <NavigationCard
          image={data.image3.childImageSharp.fluid}
          title="Extendable"
        >
          Integer malesuada dolor sed arcu faucibus, a rhoncus turpis volutpat.
          Integer congue nisl eu congue gravida. Cras non viverra velit. Sed
          sodales nulla sapien. Fusce luctus felis sed nibh volutpat pharetra.
        </NavigationCard>
      </CardDeck>
    </Container>
  );
};

export default NavigationCards;
