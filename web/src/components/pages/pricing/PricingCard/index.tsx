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
} from 'reactstrap';
import {
  PricingMessages,
  ProductInfo,
} from 'locale/pages/pricing/pricingMessages';
import { IntervalType, ProductPlanDataFragment } from 'lib/generated/datamodel';
import { capitalizeFirstLetter } from 'utils/misc';
import { defaultCurrency } from 'shared/variables';

interface PricingCardArgs {
  messages: PricingMessages;
  productInfo: ProductInfo;
  currentlyMonthly: boolean;
  plans: ProductPlanDataFragment[];
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
    <Card>
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
              <h3>{capitalizeFirstLetter(args.productInfo.name)}</h3>
            </CardTitle>
            <CardText>{formatCurrency()}</CardText>
            <Button
              onClick={(evt) => {
                evt.preventDefault();
                console.log(`subscribe to ${args.productInfo.name}`);
              }}
            >
              {capitalizeFirstLetter(args.messages.subscribe)}
            </Button>
            <CardSubtitle
              style={{
                marginTop: '1rem',
                marginBottom: '2rem',
              }}
            >
              {args.productInfo.caption}
            </CardSubtitle>

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
                  <CardText
                    style={{
                      paddingLeft: '4rem',
                    }}
                  >
                    {feature}
                  </CardText>
                </ListGroupItem>
              ))}
            </ListGroup>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default pricingCard;
