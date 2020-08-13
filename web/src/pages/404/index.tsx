import React, { useEffect } from 'react';
import ErrorContent, { ErrorPageDataProps } from 'components/pages/404/index';
import ErrorMessagesEnglish from 'locale/pages/404/en';
import Layout from 'layouts/index';
import SEO from 'components/seo';

const NotFoundPage = (args: ErrorPageDataProps): JSX.Element => {
  const title = '404';
  useEffect(() => {
    if (args.location.state && 'location' in args.location.state) {
      const newLocation: string = args.location.state['location'];
      window.history.replaceState(title, title, newLocation);
    }
  }, []);
  return (
    <Layout location={args.location}>
      <SEO title={title} />
      <ErrorContent {...args} messages={ErrorMessagesEnglish} />
    </Layout>
  );
};

export default NotFoundPage;
