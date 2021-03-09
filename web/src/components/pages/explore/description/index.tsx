import React from 'react';
import { CardText, Card, CardBody, Container } from 'reactstrap';
import './index.scss';
import logo from 'assets/images/logo.svg';
import { Link } from 'gatsby';

interface DescriptionArgs {
  repo: string;
  desc: string;
}
const Description = (args: DescriptionArgs): JSX.Element => {
  return (
    <Card
      style={{
        marginTop: '31px',
      }}
    >
      <Container className="text-center">
        <h2>
          {args.repo.split('/')[0]}&apos;s {args.repo.split('/')[1]}
        </h2>
        <h6 style={{ fontSize: '0.75em' }}>
          See the rest here:{' '}
          <Link to={args.repo}>{args.repo.split('/')[1]}</Link>
        </h6>
      </Container>
      <CardBody>
        <CardText
          style={{
            outline: '0.05rem solid gray',
            padding: '0.25rem',
            fontFamily: 'Noto Sans, sans-serif',
          }}
        >
          {args.desc}
        </CardText>
        <CardText
          style={{
            textAlign: 'center',
          }}
        >
          <img
            alt="reScribe"
            src={logo}
            style={{
              width: '127px',
              height: '23px',
            }}
          ></img>
        </CardText>
      </CardBody>
    </Card>
  );
};

export default Description;
