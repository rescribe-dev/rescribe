import React from 'react';
import ExplorePage from '.';
import 'storybook/global';
import markdown from './README.md';
import { wrapRootElement } from 'storybook/rootWrapper';
import { withKnobs } from '@storybook/addon-knobs';
import { WindowLocation } from '@reach/router';
import ExploreResultComponent from './exploreResult';

const defaultPath = '/explore';
const dummyResults: JSX.Element[] = [
  <ExploreResultComponent
    key={'1'}
    repoUrl={'jschmidtnj/rescribe/api/login.go'}
    repoCode={`async create() {
        await dataBase.crateUser({name: "hello"})
      }`}
    repoName={'reScribe'}
    repoDes={
      'On mobile this will go below the search result, or disappear entirely to be replaced by only the link to the full repository'
    }
    repoLang={'TypeScript'}
    selected={false}
  />,
  <ExploreResultComponent
    key={'2'}
    repoUrl={'the other file'}
    repoCode={''}
    repoName={'reScribe2'}
    repoDes={
      'On mobile asif is going to make an app and this will go below the search result, or disappear entirely to be replaced by only the link to the full repository'
    }
    repoLang={'Swift'}
    selected={true}
  />,
];

export const ExplorePageStorybook = (): JSX.Element => {
  const currentPath: WindowLocation = ({
    pathname: `${defaultPath}`,
  } as unknown) as WindowLocation;

  return wrapRootElement({
    element: <ExplorePage location={currentPath} results={dummyResults} />,
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
