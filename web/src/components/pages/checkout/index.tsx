import React from 'react';
import {
  Container,
  Card,
  CardTitle,
  Row,
  Col,
  CardBody,
  CardText,
  ListGroup,
  ListGroupItem,
} from 'reactstrap';
import './index.scss';
import { PageProps } from 'gatsby';
import { CheckoutMessages } from 'locale/pages/checkout/checkoutMessages';
import { isSSR } from 'utils/checkSSR';
import { useSelector } from 'react-redux';
import { RootState } from 'state';
import { CartObject, CurrencyData } from 'state/purchase/types';
import formatCurrency from 'utils/currency';

export interface CheckoutPageProps extends PageProps {
  data: Record<string, unknown>;
}

interface CheckoutPageContentProps extends CheckoutPageProps {
  messages: CheckoutMessages;
}

const CheckoutPage = (_args: CheckoutPageContentProps): JSX.Element => {
  const cart = isSSR
    ? undefined
    : useSelector<RootState, CartObject[] | undefined>(
        (state) => state.purchaseReducer.cart
      );
  const currentCurrency: CurrencyData | undefined = isSSR
    ? undefined
    : useSelector<RootState, CurrencyData>(
        (state) => state.purchaseReducer.paymentCurrency
      );
  const formatPrice = (amount: number): string => {
    if (!currentCurrency) {
      return '';
    }
    return formatCurrency(amount, currentCurrency);
  };
  return (
    <>
      <Container>
        <Row>
          <Col>
            <h2>Checkout</h2>
          </Col>
          <Col>
            <Card>
              <CardBody>
                <CardTitle>Order Summary</CardTitle>
                {!(cart && cart.length > 0) ? (
                  <CardText>Nothing in cart</CardText>
                ) : (
                  <ListGroup>
                    {cart.map((item) => {
                      return (
                        <ListGroupItem key={`product-${item.name}`}>
                          <Container>
                            <Row>
                              <Col>
                                <CardText>{item.name}</CardText>
                              </Col>
                              <Col>
                                <CardText>{formatPrice(item.price)}</CardText>
                              </Col>
                            </Row>
                          </Container>
                        </ListGroupItem>
                      );
                    })}
                  </ListGroup>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default CheckoutPage;
