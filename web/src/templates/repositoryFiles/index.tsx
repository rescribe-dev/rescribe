import React from 'react';
import SEO from 'components/seo';
import PrivateRoute from 'components/privateRoute';
import Layout from 'layouts';

import RepositoryContent, {
  RepositoryPageDataProps,
} from 'components/templates/repositoryFiles/index';
import RepositoryFilesMessagesEnglish from 'locale/templates/repositoryFiles/en';

const RepositoryFilesPage = (args: RepositoryPageDataProps): JSX.Element => {
  return (
    <PrivateRoute>
      <Layout location={args.location}>
        <SEO title="Repository" />
        <RepositoryContent
          {...args}
          messages={RepositoryFilesMessagesEnglish}
        />
      </Layout>
    </PrivateRoute>
  );
};

export default RepositoryFilesPage;
