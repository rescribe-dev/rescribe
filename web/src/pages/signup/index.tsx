import React from 'react';
import Layout from 'layouts/index';
import SEO from 'components/seo';
import RegisterContent, {
  RegisterPageDataProps,
} from 'components/pages/register/index';
import RegisterMessagesEnglish from 'locale/pages/register/en';

const RegisterPage = (args: RegisterPageDataProps): JSX.Element => {
  return (
    <Layout location={args.location}>
      <SEO title="Register" />
      <RegisterContent {...args} messages={RegisterMessagesEnglish} />
    </Layout>
  );
};

export default RegisterPage;
