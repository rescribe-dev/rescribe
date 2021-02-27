import React, { ReactNode } from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  CardText,
  Container,
  CardImg,
} from 'reactstrap';
import './index.scss';
import Img, { FluidObject } from 'gatsby-image';

interface NavCardArgs {
  title: string;
  image: FluidObject;
  children: ReactNode;
}

const NavigationCard = (args: NavCardArgs): JSX.Element => {
  return (
    <Card
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
