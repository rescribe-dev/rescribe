import React from 'react';

import SEO from 'components/seo';
import PrivateRoute from 'components/privateRoute';
import Layout from 'layouts';
import SettingsContent, {
  SettingsPageDataProps,
} from 'components/pages/settings';
import SettingsMessagesEnglish from 'locale/pages/settings/en';

const SettingsPage = (args: SettingsPageDataProps): JSX.Element => {
  return (
    <PrivateRoute location={args.location}>
      <Layout location={args.location}>
        <SEO title="Settings" />
        <SettingsContent {...args} messages={SettingsMessagesEnglish} />
      </Layout>
    </PrivateRoute>
  );
};

export default SettingsPage;
