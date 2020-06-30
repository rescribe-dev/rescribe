import React from 'react';
import SEO from 'components/seo';
import PrivateRoute from 'components/privateRoute';
import Layout from 'layouts';

import RepositoryContent, {
  RepositoryPageDataProps,
} from 'components/templates/repository/index';
import RepositoryMessagesEnglish from 'locale/templates/repository/en';

const RepositoryPage = (args: RepositoryPageDataProps): JSX.Element => {
  return (
    <PrivateRoute>
      <Layout location={args.location}>
        <SEO title="Repository" />
        <RepositoryContent {...args} messages={RepositoryMessagesEnglish} />
      </Layout>
    </PrivateRoute>
  );
};

export default RepositoryPage;
