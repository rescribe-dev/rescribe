import { GatsbyNode } from 'gatsby';
import { resolve } from 'path';

const createPages: GatsbyNode['createPages'] = async ({ actions }) => {
  const { createPage } = actions;
  createPage({
    path: '/:username',
    component: resolve('src/templates/user/index.tsx'),
    matchPath: '/:username',
    context: {}, // optional
  });
  createPage({
    path: '/:username/projects/:projectName',
    component: resolve('src/templates/project/index.tsx'),
    matchPath: '/:username/projects/:projectName',
    context: {}, // optional
  });
  createPage({
    path: '/:username/:repositoryName',
    component: resolve('src/templates/repository/index.tsx'),
    matchPath: '/:username/:repositoryName',
    context: {}, // optional
  });
};

export default createPages;
