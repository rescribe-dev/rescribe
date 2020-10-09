import React from 'react';
import SEO from 'components/seo';
import PrivateRoute from 'components/privateRoute';
import Layout from 'layouts';

import RepositoriesContent, {
  RepositoriesPageDataProps,
} from 'components/templates/repositories/index';
import RepositoriesMessagesEnglish from 'locale/templates/repositories/en';

const RepositoriesPage = (args: RepositoriesPageDataProps): JSX.Element => {
  return (
    <PrivateRoute location={args.location}>
      <Layout location={args.location}>
        <SEO title="Repositories" />
        <RepositoriesContent {...args} messages={RepositoriesMessagesEnglish} />
      </Layout>
    </PrivateRoute>
  );
};

export default RepositoriesPage;
