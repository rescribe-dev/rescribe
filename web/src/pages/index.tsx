import React from 'react';
import Layout from 'layouts/index';
import SEO from 'components/seo';
import IndexContent, { IndexPageProps } from 'components/pages/index/index';
import IndexMessagesEnglish from 'locale/pages/index/en';

const IndexPage = (args: IndexPageProps): JSX.Element => {
  return (
    <Layout location={args.location}>
      <SEO title="reScribe" />
      <IndexContent {...args} messages={IndexMessagesEnglish} />
    </Layout>
  );
};

export default IndexPage;
