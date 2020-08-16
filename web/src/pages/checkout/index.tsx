import React from 'react';
import Layout from 'layouts/index';
import SEO from 'components/seo';
import CheckoutContent, { CheckoutPageProps } from 'components/pages/checkout';
import CheckoutMessagesEnglish from 'locale/pages/checkout/en';

const CheckoutPage = (args: CheckoutPageProps): JSX.Element => {
  return (
    <Layout location={args.location}>
      <SEO title="checkout" />
      <CheckoutContent {...args} messages={CheckoutMessagesEnglish} />
    </Layout>
  );
};

export default CheckoutPage;
