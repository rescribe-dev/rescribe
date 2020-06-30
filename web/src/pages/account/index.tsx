import React from 'react';

import SEO from 'components/seo';
import PrivateRoute from 'components/privateRoute';
import Layout from 'layouts';
import AccountContent, { AccountPageDataProps } from 'components/pages/account';
import AccountMessagesEnglish from 'locale/pages/account/en';

const AccountPage = (args: AccountPageDataProps): JSX.Element => {
  return (
    <PrivateRoute>
      <Layout location={args.location}>
        <SEO title="Account" />
        <AccountContent {...args} messages={AccountMessagesEnglish} />
      </Layout>
    </PrivateRoute>
  );
};

export default AccountPage;
