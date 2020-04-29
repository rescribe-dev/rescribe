import React from "react";
import { graphql } from "gatsby";
import Img, { FluidObject } from "gatsby-image";
import ReactHtmlParser from "react-html-parser";

interface BlogData {
  title: {
    text: string;
  };
  subtitle: {
    text: string;
  };
  content: {
    html: string;
    text: string;
  };
  hero: {
    fluid: FluidObject;
  };
}

interface BlogArgs {
  pageContext: {
    id: string;
  };
  data: {
    prismicBlogPost: {
      data: BlogData;
    };
  };
}

const BlogPost = (args: BlogArgs) => {
  const postData = args.data.prismicBlogPost.data as BlogData;
  return (
    <div id="blogpost">
      {postData.hero.fluid ? <Img fluid={postData.hero.fluid} /> : <></>}
      <h1>{postData.title.text}</h1>
      <h2>{postData.subtitle.text}</h2>
      <div>{ReactHtmlParser(postData.content.html)}</div>
    </div>
  );
};

export const query = graphql`
  query blogPost($id: String!) {
    prismicBlogPost(id: { eq: $id }) {
      data {
        title {
          text
        }
        subtitle {
          text
        }
        content {
          html
        }
        hero {
          fluid {
            ...GatsbyPrismicImageFluid
          }
        }
      }
    }
  }
`;

export default BlogPost;
