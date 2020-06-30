import React from 'react';
import SEO from 'components/seo';
import Layout from 'layouts';

import UserContent, {
  UserPageDataProps,
} from 'components/templates/user/index';
import UserMessagesEnglish from 'locale/templates/user/en';

const UserPage = (args: UserPageDataProps): JSX.Element => {
  return (
    <Layout location={args.location}>
      <SEO title="User" />
      <UserContent {...args} messages={UserMessagesEnglish} />
    </Layout>
  );
};

export default UserPage;
