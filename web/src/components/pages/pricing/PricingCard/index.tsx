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
import { defaultCurrency } from 'utils/variables';

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
      <CardBody>
        {!validProduct ? (
          <p>invalid product provided</p>
        ) : (
          <>
            <CardTitle>
              {capitalizeFirstLetter(args.productInfo.name)}
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
            <CardSubtitle>{args.productInfo.caption}</CardSubtitle>

            <ListGroup>
              {args.productInfo.features.map((feature, index) => (
                <ListGroupItem
                  key={`product-${args.productInfo.name}-feature-${index}`}
                >
                  <CardText>{feature}</CardText>
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
