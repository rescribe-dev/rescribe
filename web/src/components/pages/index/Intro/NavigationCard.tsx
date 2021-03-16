import React, { ReactNode } from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  CardText,
  Container,
  CardImg,
} from 'reactstrap';
import Img, { FluidObject } from 'gatsby-image';
import { StyleSheet, css } from 'aphrodite';

interface NavCardArgs {
  title: string;
  image: FluidObject;
  children: ReactNode;
}

const styles = StyleSheet.create({
  colors: {
    '.light': {
      '--bg-how-to-use': 'var(--gray1)',
    },
    '.dark': {
      '--bg-how-to-use': 'var(--gray4)',
    },
  },
});

const NavigationCard = (args: NavCardArgs): JSX.Element => {
  return (
    <Card
      className={css(styles.colors)}
      style={{
        backgroundColor: 'var(--bg-card-color)',
      }}
    >
      <Container
        style={{
          backgroundColor: 'var(--bg-image-color)',
          paddingBottom: '1rem',
        }}
      >
        <CardImg
          top
          tag={Img}
          fluid={args.image}
          style={{
            maxWidth: '200px',
            margin: 'auto',
            marginTop: '1rem',
          }}
          alt={`image-${args.title.replace(' ', '-')}`}
        />
      </Container>
      <CardBody>
        <CardTitle>
          <b>{args.title}</b>
        </CardTitle>
        <CardText>{args.children}</CardText>
      </CardBody>
    </Card>
  );
};

export default NavigationCard;
