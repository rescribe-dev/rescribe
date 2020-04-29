import path from "path";

/* eslint @typescript-eslint/camelcase: 0 */
/* eslint @typescript-eslint/no-unused-vars: 0 */

export default {
  siteMetadata: {
    title: `Rescribe`,
    description: `search engine for code`,
    author: `rescribe`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    // Add typescript stack into webpack
    `gatsby-plugin-typescript`,
    `gatsby-plugin-sass`,
    // You can have multiple instances of this plugin
    // to read source nodes from different locations on your
    // filesystem.
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: path.resolve(`./src/assets/images`),
        name: "images",
        ignore: [`**/.*`], // ignore files starting with a dot
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `files`,
        path: path.resolve(`./src/files`),
        ignore: [`**/.*`], // ignore files starting with a dot
      },
    },
    "gatsby-transformer-sharp",
    "gatsby-plugin-sharp",
    {
      resolve: `gatsby-plugin-netlify`,
      options: {
        headers: {}, // option to add more headers. `Link` headers are transformed by the below criteria
        allPageHeaders: [], // option to add headers for all pages. `Link` headers are transformed by the below criteria
        mergeSecurityHeaders: true, // boolean to turn off the default security headers
        mergeLinkHeaders: true, // boolean to turn off the default gatsby js headers
        mergeCachingHeaders: true, // boolean to turn off the default caching headers
        generateMatchPathRewrites: false, // boolean to turn off automatic creation of redirect rules for client only paths
      },
    },
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `./typography`,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Rescribe`,
        short_name: `rescribe`,
        start_url: `/`,
        background_color: `#ffffffc9`,
        theme_color: `#a2466c`,
        display: `standalone`,
        icon: `src/assets/images/icon.png`,
      },
    },
    `gatsby-plugin-offline`,
    `gatsby-plugin-remove-trailing-slashes`,
    `gatsby-plugin-styled-components`,
  ],
};
