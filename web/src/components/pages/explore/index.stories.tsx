import React from 'react';
import ExplorePage from '.';
import 'storybook/global';
import markdown from './README.md';
import { wrapRootElement } from 'storybook/rootWrapper';
import { withKnobs } from '@storybook/addon-knobs';
import { WindowLocation } from '@reach/router';
import { ExploreResultType } from 'locale/pages/explore/exploreMessages';
import ExploreResultComponent from './exploreResult';
import { result } from 'lodash';

const defaultPath = '/explore';

const dummyResults: JSX.Element[] = [
    <ExploreResultComponent 
      repoUrl  = {'jschmidtnj/rescribe/api/login.go'}
      repoCode = {''}
      repoName = {'reScribe'}
      repoDes  = {'On mobile this will go below the search result, or disappear entirely to be replaced by only the link to the full repository'}
      repoLang = {'TypeScript'}
      selected = {false}
    />,
    <ExploreResultComponent
      repoUrl  = {'the other file'}
      repoCode = {''}
      repoName = {'reScribe2'}
      repoDes  = {'On mobile asif is going to make an app and this will go below the search result, or disappear entirely to be replaced by only the link to the full repository'}
      repoLang = {'Swift'}
      selected = {true}
    />
  ];

export const ExplorePageStorybook = (): JSX.Element => {
  const currentPath: WindowLocation = ({
    pathname: `${defaultPath}`,
  } as unknown) as WindowLocation;

  return wrapRootElement({
    element: <ExplorePage location={currentPath} results={dummyResults}/>
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
