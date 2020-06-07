import { GatsbyNode } from 'gatsby';
import { resolve } from 'path';

const createPages: GatsbyNode['createPages'] = async ({ actions }) => {
  const { createPage } = actions;
  createPage({
    path: '/project/:projectID',
    component: resolve('src/templates/project/index.tsx'),
    matchPath: '/project/:projectID',
    context: {}, // optional
  });
  createPage({
    path: '/:username',
    component: resolve('src/templates/user/index.tsx'),
    matchPath: '/:username',
    context: {}, // optional
  });
};

export default createPages;
