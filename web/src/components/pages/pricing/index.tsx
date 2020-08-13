import React, { useState } from 'react';
import { Container, Row, Col, CustomInput, CardText } from 'reactstrap';
import './index.scss';
// import NavCard from 'components/pages/NaviagtionCard';
import { PageProps } from 'gatsby';
import { PricingMessages } from 'locale/pages/pricing/pricingMessages';
import { useQuery, ApolloError, QueryResult } from '@apollo/react-hooks';
import {
  ProductsQuery,
  ProductsQueryVariables,
  Products,
} from 'lib/generated/datamodel';
import { isSSR } from 'utils/checkSSR';
import isDebug from 'utils/mode';
import { toast } from 'react-toastify';
import PricingCard from './PricingCard';

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
        fetchPolicy: isDebug() ? 'no-cache' : 'cache-first', // disable cache if in debug
        onError: (err) => {
          toast((err as ApolloError).message, {
            type: 'error',
          });
        },
      });
  const [currentlyMonthly, setCurrentlyMonthly] = useState<boolean>(true);
  return (
    <Container>
      {!productsQueryRes ||
      productsQueryRes.loading ||
      !productsQueryRes.data ? (
        <p>loading...</p>
      ) : (
        <>
          <Row className="justify-content-md-center">
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
          <Row>
            {productsQueryRes.data.products.map((product) => (
              <Col key={`product-${product.name}-pricing-card`}>
                <PricingCard
                  messages={args.messages}
                  currentlyMonthly={currentlyMonthly}
                  plans={product.plans}
                  productInfo={args.messages.products[product.name]}
                />
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
};

export default PricingPage;
