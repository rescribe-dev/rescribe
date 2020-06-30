import React from 'react';
import Img, { FluidObject } from 'gatsby-image';
import './index.scss';
import { PageProps } from 'gatsby';
import { BlogMessages } from 'locale/templates/blog/blogMessages';

interface BlogData {
  title: string;
  subtitle: string;
  content: string;
  hero: {
    image: FluidObject;
  };
}

export interface BlogPageDataProps extends PageProps {
  pageContext: {
    id: string;
  };
  data: {
    blogPost: {
      data: BlogData;
    };
  };
}

interface BlogArgs extends BlogPageDataProps {
  messages: BlogMessages;
}

const BlogPost = (args: BlogArgs): JSX.Element => {
  const postData = args.data.blogPost.data as BlogData;
  return (
    <div id="blogpost">
      {postData.hero.image ? <Img fluid={postData.hero.image} /> : <></>}
      <h1>{postData.title}</h1>
      <h2>{postData.subtitle}</h2>
      <div>{postData.content}</div>
    </div>
  );
};

export default BlogPost;
