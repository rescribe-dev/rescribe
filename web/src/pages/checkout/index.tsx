import React from 'react';
import Layout from 'layouts/index';
import SEO from 'components/seo';
import CheckoutContent, { CheckoutPageProps } from 'components/pages/checkout';
import CheckoutMessagesEnglish from 'locale/pages/checkout/en';
import PrivateRoute from 'components/privateRoute';

const CheckoutPage = (args: CheckoutPageProps): JSX.Element => {
  return (
    <PrivateRoute location={args.location}>
      <Layout location={args.location}>
        <SEO title="checkout" />
        <CheckoutContent {...args} messages={CheckoutMessagesEnglish} />
      </Layout>
    </PrivateRoute>
  );
};

export default CheckoutPage;
