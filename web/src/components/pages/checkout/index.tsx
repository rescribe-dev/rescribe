import React, { useState, useEffect, Dispatch } from 'react';
import { Container, Card, CardBody, CardTitle } from 'reactstrap';
import './index.scss';
import { PageProps } from 'gatsby';
import { CheckoutMessages } from 'locale/pages/checkout/checkoutMessages';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Main, { OnCheckoutComplete } from './Main';
import { toast } from 'react-toastify';
import { clearCart } from 'state/purchase/actions';
import { isSSR } from 'utils/checkSSR';
import { useDispatch } from 'react-redux';

export interface CheckoutPageProps extends PageProps {
  data: Record<string, unknown>;
}

interface CheckoutPageContentProps extends CheckoutPageProps {
  messages: CheckoutMessages;
}

const CheckoutPage = (args: CheckoutPageContentProps): JSX.Element => {
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  const [
    stripeElement,
    setStripeElement,
  ] = useState<Promise<Stripe | null> | null>(null);

  let dispatch: Dispatch<any>;
  if (!isSSR) {
    dispatch = useDispatch();
  }

  const onCheckoutComplete: OnCheckoutComplete = (name) => {
    setCheckoutComplete(true);
    dispatch(clearCart());
    toast(`Successfully purchased ${name}`, {
      type: 'success',
    });
  };

  useEffect(() => {
    (async () => {
      if (!process.env.GATSBY_STRIPE_SITE_KEY) {
        throw new Error('cannot find stripe key');
      }
      setStripeElement(loadStripe(process.env.GATSBY_STRIPE_SITE_KEY));
    })();
  }, []);

  return (
    <Elements stripe={stripeElement}>
      <Container
        style={{
          marginTop: '4rem',
        }}
      >
        <h2
          className="text-center"
          style={{
            marginBottom: '3rem',
          }}
        >
          Checkout
        </h2>
        {!checkoutComplete ? (
          <Main
            messages={args.messages}
            onCheckoutComplete={onCheckoutComplete}
          />
        ) : (
          <>
            <Card>
              <CardBody>
                <CardTitle>
                  <h3>Checkout completed</h3>
                </CardTitle>
              </CardBody>
            </Card>
          </>
        )}
      </Container>
    </Elements>
  );
};

export default CheckoutPage;
