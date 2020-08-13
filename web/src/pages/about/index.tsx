import React from 'react';
import Layout from 'layouts/index';
import SEO from 'components/seo';
import AboutContent, { AboutPageProps } from 'components/pages/about';
import AboutMessagesEnglish from 'locale/pages/about/en';

const AboutPage = (args: AboutPageProps): JSX.Element => {
  return (
    <Layout location={args.location}>
      <SEO title="about" />
      <AboutContent {...args} messages={AboutMessagesEnglish} />
    </Layout>
  );
};

export default AboutPage;
