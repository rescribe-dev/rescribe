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
import { IntervalType, ProductDataFragment } from 'lib/generated/datamodel';
import { capitalizeFirstLetter, capitalizeOnlyFirstLetter } from 'utils/misc';
import { navigate } from '@reach/router';
import { CartObject } from 'state/purchase/types';
import { isSSR } from 'utils/checkSSR';
import { RootState } from 'state';
import { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { render } from 'mustache';
import prettyBytes from 'pretty-bytes';
import formatCurrency from 'utils/currency';
import { FormattedMessage } from 'react-intl';
import { addToCart, removeFromCart } from 'state/purchase/actions';
import {
  defaultProductName,
  teamProductName,
  enterpriseProductName,
} from 'shared/variables';
import { CurrencyData } from 'state/settings/types';
import { defaultLanguage } from 'shared/languages';
import { StyleSheet, css } from 'aphrodite';

interface PricingCardArgs {
  messages: PricingMessages;
  productInfo: ProductInfo;
  currentlyMonthly: boolean;
  productData: ProductDataFragment;
  currentPlan: string | undefined;
}

const intervals = new Set([IntervalType.Month, IntervalType.Year]);

const mutuallyExclusivePlans = new Set([
  defaultProductName,
  teamProductName,
  enterpriseProductName,
]);

const storageKey = 'storage';
const keysWithStorageUnits = [storageKey];

const styles = StyleSheet.create({
  colors: {
    '.light': {
      '--bg-pricing-card-color': 'var(--gray1)',
    },
    '.dark': {
      '--bg-pricing-card-color': 'var(--gray4)',
    },
  },
});

const pricingCard = (args: PricingCardArgs): JSX.Element => {
  const [validProduct, setValidProduct] = useState<boolean>(true);
  const isDefaultPlan = args.productInfo.name === defaultProductName;

  const currentCurrency: CurrencyData | undefined = isSSR
    ? undefined
    : useSelector<RootState, CurrencyData>(
        (state) => state.settingsReducer.displayCurrency
      );

  const currentCart: CartObject[] | undefined = isSSR
    ? undefined
    : useSelector<RootState, CartObject[]>(
        (state) => state.purchaseReducer.cart
      );

  const language: string = isSSR
    ? defaultLanguage
    : useSelector<RootState, string>((state) => state.settingsReducer.language);

  const formatPrice = (): string => {
    const currentInterval =
      args.currentlyMonthly || isDefaultPlan
        ? IntervalType.Month
        : IntervalType.Year;
    const currentPlan = args.productData.plans.find(
      (plan) => plan.interval === currentInterval
    );
    if (!currentPlan || !currentCurrency) return '';
    return formatCurrency(currentPlan.amount, currentCurrency, language);
  };

  const replaceValues: Record<string, number | string> = {
    numPublicRepositories: args.productData.publicRepositories,
    numPrivateRepositories: args.productData.privateRepositories,
    [storageKey]: args.productData.storage,
  };

  const renderFeature = (feature: string): string => {
    for (const key in replaceValues) {
      if (feature.includes(key)) {
        let value = replaceValues[key];
        if (
          typeof value === 'number' &&
          (value as number) === Number.MAX_SAFE_INTEGER
        ) {
          value = 'unlimited';
        } else if (keysWithStorageUnits.includes(key)) {
          value = prettyBytes(value as number, {
            locale: language,
          });
        } else {
          value = replaceValues[key];
        }
        feature = render(feature, {
          [key]: value,
        });
        break;
      }
    }
    return capitalizeOnlyFirstLetter(feature);
  };

  let dispatch: Dispatch<any>;
  if (!isSSR) {
    dispatch = useDispatch();
  }

  useEffect(() => {
    const foundIntervals = new Set<IntervalType>();
    for (const plan of args.productData.plans) {
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
        backgroundColor: 'var(--bg-pricing-card-color)',
      }}
      className={css(styles.colors)}
    >
      <CardBody
        className="text-center"
        style={{
          paddingLeft: 0,
          paddingRight: 0,
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
                    {formatPrice()}
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
                    <FormattedMessage
                      id={args.currentlyMonthly ? 'month' : 'year'}
                    >
                      {(messages: string[]) => <>{'/ ' + messages[0]}</>}
                    </FormattedMessage>
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
                if (typeof currentCart === 'undefined') {
                  return;
                }
                const currentInterval =
                  args.currentlyMonthly || isDefaultPlan
                    ? IntervalType.Month
                    : IntervalType.Year;
                const currentPlan = args.productData.plans.find(
                  (plan) => plan.interval === currentInterval
                );
                if (!currentPlan) {
                  return;
                }
                const currentCartItem = currentCart.find((item) =>
                  mutuallyExclusivePlans.has(item.name)
                );
                if (currentCartItem) {
                  dispatch(removeFromCart(currentCartItem.name));
                }
                dispatch(
                  addToCart({
                    name: args.productData.name,
                    displayName: args.productInfo.name,
                    interval: currentInterval,
                    price: currentPlan.amount,
                  })
                );
                navigate('/checkout');
              }}
              disabled={args.currentPlan === args.productData.name}
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
                      backgroundColor: 'var(--bg-pricing-card-color)',
                    }}
                  >
                    <Row>
                      <Col xs="auto">✓</Col>
                      <Col xs="auto">
                        <CardText>{renderFeature(feature)}</CardText>
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
