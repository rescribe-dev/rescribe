import React, { useState, useEffect } from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  CardSubtitle,
  CardText,
  Button,
  ListGroup,
  ListGroupItem,
  Col,
  Row,
  Container,
} from 'reactstrap';
import {
  PricingMessages,
  ProductInfo,
} from 'locale/pages/pricing/pricingMessages';
import { IntervalType, ProductPlanDataFragment } from 'lib/generated/datamodel';
import { capitalizeFirstLetter } from 'utils/misc';
import { defaultCurrency } from 'shared/variables';
import { isLoggedIn } from 'state/auth/getters';
import { navigate } from '@reach/router';

interface PricingCardArgs {
  messages: PricingMessages;
  productInfo: ProductInfo;
  currentlyMonthly: boolean;
  plans: ProductPlanDataFragment[];
  currentPlan: string | undefined;
  name: string;
}

const intervals = new Set([IntervalType.Month, IntervalType.Year]);

const defaultPlan = 'free';

const pricingCard = (args: PricingCardArgs): JSX.Element => {
  const [validProduct, setValidProduct] = useState<boolean>(true);
  const isDefaultPlan = args.productInfo.name === defaultPlan;

  const formatCurrency = (): string => {
    const currentInterval =
      args.currentlyMonthly || isDefaultPlan
        ? IntervalType.Month
        : IntervalType.Year;
    const currentPlan = args.plans.find(
      (plan) => plan.interval === currentInterval
    );
    if (!currentPlan) return '';
    const currency = 'usd';
    const exchangeRate = currency === defaultCurrency ? 1 : 1;
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
    }).format(exchangeRate * currentPlan.amount);
  };

  useEffect(() => {
    const foundIntervals = new Set<IntervalType>();
    for (const plan of args.plans) {
      if (!intervals.has(plan.interval)) {
        setValidProduct(false);
        break;
      } else {
        foundIntervals.add(plan.interval);
      }
    }
    if (validProduct && !isDefaultPlan) {
      if (foundIntervals.size < intervals.size) {
        setValidProduct(false);
      }
    }
  }, []);
  return (
    <Card
      style={{
        maxWidth: '27rem',
      }}
    >
      <CardBody
        className="text-center"
        style={{
          paddingLeft: 0,
          paddingRight: 0,
          paddingBottom: 0,
        }}
      >
        {!validProduct ? (
          <p>invalid product provided</p>
        ) : (
          <>
            <CardTitle>
              <h4>{capitalizeFirstLetter(args.productInfo.name)}</h4>
            </CardTitle>
            <Container
              style={{
                marginBottom: '1rem',
              }}
            >
              <Row className="justify-content-center">
                <Col
                  xs="auto"
                  style={{
                    padding: 0,
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                    }}
                  >
                    {formatCurrency()}
                  </h3>
                </Col>
                <Col
                  xs="auto"
                  style={{
                    padding: 0,
                    paddingLeft: '0.5rem',
                    marginTop: 'auto',
                  }}
                >
                  <CardText>
                    /{' '}
                    {args.currentlyMonthly
                      ? args.messages.month
                      : args.messages.year}
                  </CardText>
                </Col>
              </Row>
            </Container>
            <Button
              style={{
                backgroundColor: args.productInfo.buttonColor,
                borderColor: args.productInfo.buttonColor,
              }}
              onClick={async (evt) => {
                evt.preventDefault();
                if (!(await isLoggedIn())) {
                  navigate('/login');
                  return;
                }
                console.log(`subscribe to ${args.productInfo.name}`);
              }}
              disabled={args.currentPlan === args.name}
            >
              {capitalizeFirstLetter(args.messages.subscribe)}
            </Button>
            <CardSubtitle
              style={{
                margin: '2rem',
              }}
            >
              <b>{args.productInfo.caption}</b>
            </CardSubtitle>
            <Container>
              <ListGroup
                className="list-group-flush"
                style={{
                  marginLeft: 0,
                }}
              >
                {args.productInfo.features.map((feature, index) => (
                  <ListGroupItem
                    key={`product-${args.productInfo.name}-feature-${index}`}
                    style={{
                      marginBottom: 0,
                      border: 0,
                      textAlign: 'left',
                    }}
                  >
                    <Row>
                      <Col xs="auto">✓</Col>
                      <Col xs="auto">
                        <CardText>{feature}</CardText>
                      </Col>
                    </Row>
                  </ListGroupItem>
                ))}
              </ListGroup>
            </Container>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default pricingCard;
