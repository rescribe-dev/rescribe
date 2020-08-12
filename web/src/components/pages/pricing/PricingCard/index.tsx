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

interface PricingCardArgs {
  messages: PricingMessages;
  productInfo: ProductInfo;
  currentlyMonthly: boolean;
  plans: ProductPlanDataFragment[];
}

const validIntervals = [IntervalType.Month, IntervalType.Year];

const pricingCard = (args: PricingCardArgs): JSX.Element => {
  const [validProduct, setValidProduct] = useState<boolean>(true);
  useEffect(() => {
    if (args.plans.find((plan) => !validIntervals.includes(plan.interval))) {
      setValidProduct(false);
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
