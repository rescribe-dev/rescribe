import React from 'react';
import Layout from 'layouts/index';
import SEO from 'components/seo';
import ExploreContent, { PricingPageProps } from 'components/pages/pricing';
import PricingMessagesEnglish from 'locale/pages/pricing/en';

const PricingPage = (args: PricingPageProps): JSX.Element => {
  return (
    <Layout location={args.location}>
      <SEO title="pricing" />
      <ExploreContent {...args} messages={PricingMessagesEnglish} />
    </Layout>
  );
};

export default PricingPage;
