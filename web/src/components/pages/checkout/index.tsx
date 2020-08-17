import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import './index.scss';
import { PageProps } from 'gatsby';
import { CheckoutMessages } from 'locale/pages/checkout/checkoutMessages';
import Summary from './Summary';
import Address from './Address';

export interface CheckoutPageProps extends PageProps {
  data: Record<string, unknown>;
}

interface CheckoutPageContentProps extends CheckoutPageProps {
  messages: CheckoutMessages;
}

const CheckoutPage = (args: CheckoutPageContentProps): JSX.Element => {
  return (
    <>
      <Container
        style={{
          marginTop: '4rem',
        }}
      >
        <Row>
          <Col md="7">
            <h2 className="text-center">Checkout</h2>
            <Container>
              <h4>Billing Address</h4>
              <Address messages={args.messages} />
            </Container>
          </Col>
          <Col md="4">
            <Summary messages={args.messages} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default CheckoutPage;
