import React from 'react';
import { Container } from 'reactstrap';
import './index.scss';
import { PageProps } from 'gatsby';
import { CheckoutMessages } from 'locale/pages/checkout/checkoutMessages';

export interface CheckoutPageProps extends PageProps {
  data: Record<string, unknown>;
}

interface CheckoutPageContentProps extends CheckoutPageProps {
  messages: CheckoutMessages;
}

const CheckoutPage = (_args: CheckoutPageContentProps): JSX.Element => {
  return (
    <>
      <Container>
        <p>checkout page</p>
      </Container>
    </>
  );
};

export default CheckoutPage;
