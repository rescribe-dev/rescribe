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
  Button,
} from 'reactstrap';
import './index.scss';
import { CheckoutMessages } from 'locale/pages/checkout/checkoutMessages';
import { isSSR } from 'utils/checkSSR';
import { useSelector } from 'react-redux';
import { RootState } from 'state';
import { CartObject, CurrencyData } from 'state/purchase/types';
import formatCurrency from 'utils/currency';
import { IntervalType } from 'lib/generated/datamodel';
import { FormattedMessage } from 'react-intl';
import { capitalizeFirstLetter, capitalizeOnlyFirstLetter } from 'utils/misc';

interface SummaryArgs {
  messages: CheckoutMessages;
}

const Summary = (args: SummaryArgs): JSX.Element => {
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
  const total = !cart ? 0 : cart.reduce((prev, curr) => prev + curr.price, 0);
  return (
    <Card>
      <CardBody
        className="text-center"
        style={{
          paddingLeft: 0,
          paddingRight: 0,
        }}
      >
        <Button
          disabled={!cart || cart.length === 0 /* TODO or... */}
          style={{
            backgroundColor: 'var(--light-orange)',
            borderColor: 'var(--light-orange)',
          }}
          onClick={(evt) => {
            evt.preventDefault();
            console.log('submit order');
          }}
        >
          {capitalizeOnlyFirstLetter(args.messages['place your order'])}
        </Button>
        <hr />
        <CardTitle>
          <h4>Order Summary</h4>
        </CardTitle>
        {!(cart && cart.length > 0) ? (
          <CardText>Nothing in cart</CardText>
        ) : (
          <>
            <ListGroup
              className="list-group-flush"
              style={{
                marginLeft: 0,
              }}
            >
              {cart.map((item) => {
                return (
                  <ListGroupItem key={`product-${item.displayName}`}>
                    <Container>
                      <Row className="justify-content-between">
                        <Col xs="auto">
                          <CardText>
                            {capitalizeFirstLetter(item.displayName)}
                          </CardText>
                        </Col>
                        <Col xs="auto">
                          <Row>
                            <Col
                              xs="auto"
                              style={{
                                padding: 0,
                              }}
                            >
                              <CardText>{formatPrice(item.price)}</CardText>
                            </Col>
                            {item.interval === IntervalType.Once ? null : (
                              <Col xs="auto">
                                <CardText>
                                  <FormattedMessage
                                    id={
                                      item.interval === IntervalType.Month
                                        ? 'month'
                                        : 'year'
                                    }
                                  >
                                    {(messages: string[]) => '/ ' + messages[0]}
                                  </FormattedMessage>
                                </CardText>
                              </Col>
                            )}
                          </Row>
                        </Col>
                      </Row>
                    </Container>
                  </ListGroupItem>
                );
              })}
            </ListGroup>
            <hr />
            <h4>Total: {formatPrice(total)}</h4>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default Summary;
