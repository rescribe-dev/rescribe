import React from 'react';
import { Container } from 'reactstrap';
import './index.scss';
// import NavCard from 'components/pages/NaviagtionCard';
import { PageProps } from 'gatsby';
import { PricingMessages } from 'locale/pages/pricing/pricingMessages';

export interface PricingPageProps extends PageProps {
  data: Record<string, unknown>;
}

interface PricingPageContentProps extends PricingPageProps {
  messages: PricingMessages;
}

const PricingPage = (_args: PricingPageContentProps): JSX.Element => {
  return (
    <>
      <Container>
        <p>pricing page</p>
      </Container>
    </>
  );
};

export default PricingPage;
