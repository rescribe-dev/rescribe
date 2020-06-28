import { GatsbyNode } from 'gatsby';
import { resolve } from 'path';

const languages: string[] = ['en'];

const createPages: GatsbyNode['createPages'] = async ({ actions }) => {
  const { createPage } = actions;
  const languageElements = languages.map((language) => '/' + language);
  languageElements.push('');
  for (const language of languageElements) {
    const languagePath = language.replace('/', '.');
    createPage({
      path: `${language}/:username`,
      component: resolve(`src/templates/user/index${languagePath}.tsx`),
      matchPath: `${language}/:username`,
      context: {}, // optional
    });
    createPage({
      path: `${language}/:username/projects`,
      component: resolve(`src/templates/projects/index${languagePath}.tsx`),
      matchPath: `${language}/:username/projects`,
      context: {}, // optional
    });
    createPage({
      path: `${language}/:username/projects/:projectName`,
      component: resolve(`src/templates/project/index${languagePath}.tsx`),
      matchPath: `${language}/:username/projects/:projectName`,
      context: {}, // optional
    });
    createPage({
      path: `${language}/:username/:repositoryName`,
      component: resolve(`src/templates/repository/index${languagePath}.tsx`),
      matchPath: `${language}/:username/:repositoryName`,
      context: {}, // optional
    });
  }
};

export default createPages;
