import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  CustomInput,
  CardText,
  CardDeck,
} from 'reactstrap';
import './index.scss';
import { PageProps } from 'gatsby';
import { PricingMessages } from 'locale/pages/pricing/pricingMessages';
import { useQuery, ApolloError, QueryResult } from '@apollo/react-hooks';
import {
  ProductsQuery,
  ProductsQueryVariables,
  Products,
  UserFieldsFragment,
} from 'lib/generated/datamodel';
import { isSSR } from 'utils/checkSSR';
import isDebug from 'utils/mode';
import { toast } from 'react-toastify';
import PricingCard from './PricingCard';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'state';
import { AppThunkDispatch } from 'state/thunk';
import { AuthActionTypes } from 'state/auth/types';
import { isLoggedIn } from 'state/auth/getters';
import { thunkGetUser } from 'state/auth/thunks';
import CurrencySelector from 'components/CurrencySelector';

export interface PricingPageProps extends PageProps {
  data: Record<string, unknown>;
}

interface PricingPageContentProps extends PricingPageProps {
  messages: PricingMessages;
}

const PricingPage = (args: PricingPageContentProps): JSX.Element => {
  const productsQueryRes:
    | QueryResult<ProductsQuery, ProductsQueryVariables>
    | undefined = isSSR
    ? undefined
    : useQuery<ProductsQuery, ProductsQueryVariables>(Products, {
        variables: {
          names: Object.keys(args.messages.products),
        },
        fetchPolicy: isDebug() ? 'no-cache' : 'cache-first', // disable cache if in debug
        onError: (err) => {
          toast((err as ApolloError).message, {
            type: 'error',
          });
        },
      });
  const user = isSSR
    ? undefined
    : useSelector<RootState, UserFieldsFragment | undefined>(
        (state) => state.authReducer.user
      );
  const dispatchAuthThunk = isSSR
    ? undefined
    : useDispatch<AppThunkDispatch<AuthActionTypes>>();
  useEffect(() => {
    if (dispatchAuthThunk && !user && isLoggedIn()) {
      dispatchAuthThunk(thunkGetUser()).catch((err: Error) =>
        console.error(err.message)
      );
    }
  }, []);
  const [currentlyMonthly, setCurrentlyMonthly] = useState<boolean>(true);
  return (
    <Container>
      {!productsQueryRes ||
      productsQueryRes.loading ||
      !productsQueryRes.data ? (
        <p>loading...</p>
      ) : (
        <>
          <Container
            className="text-center"
            style={{
              padding: 0,
            }}
          >
            <h1
              className="display-4"
              style={{
                margin: '2rem',
              }}
            >
              pricing
            </h1>
          </Container>
          <Row
            style={{
              marginBottom: '2rem',
              marginTop: '2rem',
            }}
            className="justify-content-center"
          >
            <Col xs="auto">
              <CardText>{args.messages.monthly}</CardText>
            </Col>
            <Col
              xs="auto"
              style={{
                padding: 0,
              }}
            >
              <CustomInput
                style={{
                  display: 'inline',
                }}
                type="switch"
                id="switchMonthly"
                name="switchType"
                onChange={() => setCurrentlyMonthly(!currentlyMonthly)}
              />
            </Col>
            <Col xs="auto">
              <CardText
                style={{
                  display: 'inline',
                }}
              >
                {args.messages.yearly}
              </CardText>
            </Col>
          </Row>
          <CardDeck className="justify-content-center">
            {productsQueryRes.data.products.map((product) => (
              <PricingCard
                key={`product-${product.name}-pricing-card`}
                messages={args.messages}
                currentlyMonthly={currentlyMonthly}
                productData={product}
                productInfo={args.messages.products[product.name]}
                currentPlan={user ? user.plan : undefined}
              />
            ))}
          </CardDeck>
          <Row
            style={{
              marginTop: '2rem',
              marginBottom: '2rem',
            }}
            className="justify-content-center"
          >
            <Col md="5">
              <CurrencySelector setPaymentCurrency={false} />
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default PricingPage;
