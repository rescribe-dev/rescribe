import React from 'react';

import SEO from 'components/seo';
import PrivateRoute from 'components/privateRoute';
import Layout from 'layouts';
import TokensContent, {
  TokensPageDataProps,
} from 'components/pages/settings/tokens';
import TokensMessagesEnglish from 'locale/pages/settings/tokens/en';

const TokensPage = (args: TokensPageDataProps): JSX.Element => {
  return (
    <PrivateRoute location={args.location}>
      <Layout location={args.location}>
        <SEO title="Tokens" />
        <TokensContent {...args} messages={TokensMessagesEnglish} />
      </Layout>
    </PrivateRoute>
  );
};

export default TokensPage;
