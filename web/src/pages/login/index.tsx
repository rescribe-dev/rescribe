import React from 'react';
import LoginContent, { LoginPageDataProps } from 'components/pages/login';
import LoginMessagesEnglish from 'locale/pages/login/en';

import Layout from 'layouts/index';
import SEO from 'components/seo';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare global {
  interface Window {
    grecaptcha: any;
  }
}

const LoginPage = (args: LoginPageDataProps): JSX.Element => {
  return (
    <Layout location={args.location}>
      <SEO title="Login" />
      <LoginContent {...args} messages={LoginMessagesEnglish} />
    </Layout>
  );
};

export default LoginPage;
