import React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  CardSubtitle,
  CardText,
  Button,
} from 'reactstrap';
import Img, { FixedObject } from 'gatsby-image';
import { Link } from 'gatsby';

import './index.scss';

interface NavCardArgs {
  title: string;
  subtitle?: string;
  body: string;
  image: FixedObject;
  linkText: string;
  linkSlug: string;
}

export const navigationCard = (args: NavCardArgs): JSX.Element => {
  const subtitle = args.subtitle ? args.subtitle : '';
  return (
    <div>
      <Card>
        <CardBody>
          <Img fixed={args.image} />
          <CardTitle>
            <strong>{args.title}</strong>
          </CardTitle>
          <CardSubtitle>{subtitle}</CardSubtitle>
          <CardText>{args.body}</CardText>
          <Button>
            <Link
              style={{ textDecoration: 'none', color: '#000' }}
              to={args.linkSlug}
            >
              {args.linkText}
            </Link>
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};

export default navigationCard;
