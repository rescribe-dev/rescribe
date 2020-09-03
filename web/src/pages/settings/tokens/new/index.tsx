import React from 'react';

import SEO from 'components/seo';
import PrivateRoute from 'components/privateRoute';
import Layout from 'layouts';
import NewContent, {
  NewPageDataProps,
} from 'components/pages/settings/tokens/new';
import NewMessagesEnglish from 'locale/pages/settings/tokens/new/en';

const NewPage = (args: NewPageDataProps): JSX.Element => {
  return (
    <PrivateRoute location={args.location}>
      <Layout location={args.location}>
        <SEO title="New" />
        <NewContent {...args} messages={NewMessagesEnglish} />
      </Layout>
    </PrivateRoute>
  );
};

export default NewPage;
