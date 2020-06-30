import React from 'react';

import SEO from 'components/seo';
import Layout from 'layouts';
import SearchContent, {
  SearchPageDataProps,
} from 'components/pages/search/index';
import SearchMessagesEnglish from 'locale/pages/search/en';

const SearchPage = (args: SearchPageDataProps): JSX.Element => {
  return (
    <Layout location={args.location}>
      <SEO title="Search" />
      <SearchContent {...args} messages={SearchMessagesEnglish} />
    </Layout>
  );
};

export default SearchPage;
