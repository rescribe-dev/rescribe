import React from 'react';
import Layout from 'layouts/index';
import SEO from 'components/seo';
import ExploreContent, { ExplorePageProps } from 'components/pages/explore';
import ExploreMessagesEnglish from 'locale/pages/explore/en';

const ExplorePage = (args: ExplorePageProps): JSX.Element => {
  return (
    <Layout location={args.location}>
      <SEO title="explore" />
      <ExploreContent {...args} messages={ExploreMessagesEnglish} />
    </Layout>
  );
};

export default ExplorePage;
