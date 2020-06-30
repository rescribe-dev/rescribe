import React from 'react';
import ErrorContent, { ErrorPageDataProps } from 'components/pages/404/index';
import ErrorMessagesEnglish from 'locale/pages/404/en';
import Layout from 'layouts/index';
import SEO from 'components/seo';

const NotFoundPage = (args: ErrorPageDataProps): JSX.Element => (
  <Layout location={args.location}>
    <SEO title="404" />
    <ErrorContent {...args} messages={ErrorMessagesEnglish} />
  </Layout>
);

export default NotFoundPage;
