import React from 'react';
import { CardText, Card, CardBody } from 'reactstrap';
import './index.scss';
import { Link } from 'gatsby';


interface DescriptionArgs {
  repository: string;
  source: string;
  description: string;
};

const Description = (args: DescriptionArgs): JSX.Element => {
  return (
    <Card>
      <CardText
        style={{
          textAlign:'center'
        }}>
        <h3><Link to={args.source}>{args.repository}</Link></h3>
      </CardText>
      <CardBody>
        <CardText
          style={{
            outline: '0.05rem solid gray',
            padding: '0.25rem'
          }}>
          {args.description}
        </CardText>
      </CardBody>
    </Card>
  );
}

export default Description;