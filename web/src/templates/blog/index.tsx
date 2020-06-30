import React from 'react';
import SEO from 'components/seo';
import Layout from 'layouts';

import BlogContent, {
  BlogPageDataProps,
} from 'components/templates/blog/index';
import BlogMessagesEnglish from 'locale/templates/user/en';

const BlogPost = (args: BlogPageDataProps): JSX.Element => {
  return (
    <Layout location={args.location}>
      <SEO title="Blog" />
      <BlogContent {...args} messages={BlogMessagesEnglish} />
    </Layout>
  );
};

export default BlogPost;
