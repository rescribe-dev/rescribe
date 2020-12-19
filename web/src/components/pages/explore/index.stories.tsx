import React from 'react';
import ExplorePageComponent from '.';
import 'storybook/global';
import markdown from './README.md';
import { wrapRootElement } from 'storybook/rootWrapper';
import { withKnobs } from '@storybook/addon-knobs';
import { WindowLocation } from '@reach/router';
import { ExploreResult } from 'locale/pages/explore/exploreMessages';

const defaultPath = '/explore';

const dummyResults = [
  {
    repoUrl: 'jschmidtnj/rescribe/api/login.go',
    repoCode: '',
    repoName: 'reScribe',
    repoLang: 'TypeScript',
    repoDes:
      'On mobile this will go below the search result, or disappear entirely to be replaced by only the link to the full repository',
    selected: true,
  },
  {
    repoUrl: 'jschmidtnj/rescribe/api/login.go',
    repoCode: '',
    repoName: 'reScribe',
    repoLang: 'TypeScript',
    repoDes:
      'On mobile this will go below the search result, or disappear entirely to be replaced by only the link to the full repository',
    selected: false,
  },
];

export const ExplorePage = (): JSX.Element => {
  const currentPath: WindowLocation = ({
    pathname: `${defaultPath}`,
  } as unknown) as WindowLocation;
  const dummy: ExploreResult[] = ({
    results: dummyResults,
  } as unknown) as ExploreResult[];
  return wrapRootElement({
    element: <ExplorePageComponent location={currentPath} results={dummy} />,
  });
};

export default {
  title: 'ExplorePage',
  decorators: [withKnobs],
  parameters: {
    notes: {
      markdown,
    },
  },
};
