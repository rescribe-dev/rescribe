import React, { useState, useEffect, Dispatch } from 'react';
import { Container, Row, Col } from 'reactstrap';
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
import Summary from './Summary';
import { CartObject } from 'state/purchase/types';
import { CurrencyData } from 'state/settings/types';
import { defaultCurrencyData } from 'state/settings/reducers';
import { AppThunkDispatch } from 'state/thunk';
import { AuthActionTypes } from 'state/auth/types';
import { thunkGetUser } from 'state/auth/thunks';

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

  const [purchasedItems, setPurchasedItems] = useState<CartObject[]>([]);

  const [currentCurrency, setCurrentCurrency] = useState<CurrencyData>(
    defaultCurrencyData
  );

  const dispatchAuthThunk = isSSR
    ? undefined
    : useDispatch<AppThunkDispatch<AuthActionTypes>>();

  const onCheckoutComplete: OnCheckoutComplete = async (name, items) => {
    try {
      if (!dispatchAuthThunk) {
        throw new Error('cannot find auth thunk');
      }
      await dispatchAuthThunk(thunkGetUser());
      setCheckoutComplete(true);
      setPurchasedItems(items);
      dispatch(clearCart());
      toast(`Successfully purchased ${name}`, {
        type: 'success',
      });
    } catch (err) {
      const errObj = err as Error;
      toast(errObj.message, {
        type: 'error',
      });
    }
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
            currentCurrency={currentCurrency}
            setCurrentCurrency={setCurrentCurrency}
          />
        ) : (
          <Row className="justify-content-center">
            <Col md="7">
              <Summary
                cart={purchasedItems}
                currency={currentCurrency}
                isComplete={checkoutComplete}
                messages={args.messages}
              />
            </Col>
          </Row>
        )}
      </Container>
    </Elements>
  );
};

export default CheckoutPage;
