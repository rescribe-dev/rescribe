import React from 'react';
import Img, { FluidObject } from 'gatsby-image';

interface BlogData {
  title: string;
  subtitle: string;
  content: string;
  hero: {
    image: FluidObject;
  };
}

interface BlogArgs {
  pageContext: {
    id: string;
  };
  data: {
    blogPost: {
      data: BlogData;
    };
  };
}

const BlogPost = (args: BlogArgs) => {
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
