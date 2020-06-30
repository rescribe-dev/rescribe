import React from 'react';
import NewContent, { NewPageDataProps } from 'components/pages/new/index';
import NewMessagesEnglish from 'locale/pages/new/en';

import Layout from 'layouts/index';
import SEO from 'components/seo';
import PrivateRoute from 'components/privateRoute';

const NewPage = (args: NewPageDataProps): JSX.Element => {
  return (
    <PrivateRoute>
      <Layout location={args.location}>
        <SEO title="Login" />
        <NewContent {...args} messages={NewMessagesEnglish} />
      </Layout>
    </PrivateRoute>
  );
};

export default NewPage;
