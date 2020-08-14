import React from 'react';
import Layout from 'layouts/index';
import SEO from 'components/seo';
import StartContent, { StartPageProps } from 'components/pages/start';
import StartMessagesEnglish from 'locale/pages/start/en';

const StartPage = (args: StartPageProps): JSX.Element => {
  return (
    <Layout location={args.location}>
      <SEO title="start" />
      <StartContent {...args} messages={StartMessagesEnglish} />
    </Layout>
  );
};

export default StartPage;
