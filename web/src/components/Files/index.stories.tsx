import React from 'react';
import Files from '.';
import 'storybook/global';
import markdown from './README.md';
import { wrapRootElement } from 'storybook/rootWrapper';
import { withKnobs, text } from '@storybook/addon-knobs';
import { WindowLocation } from '@reach/router';
import ObjectID from 'bson-objectid';

const defaultRepoName = 'test';
const defaultRepoOwner = 'username';

export const FilesView = (): JSX.Element => {
  const location: WindowLocation = ({
    pathname: text(
      'path',
      `/${defaultRepoOwner}/${defaultRepoName}/tree/README.md`
    ),
  } as unknown) as WindowLocation;
  return wrapRootElement({
    element: (
      <Files
        defaultBranch={'master'}
        location={location}
        repositoryID={new ObjectID()}
        repositoryName={text('repo name', defaultRepoName)}
        repositoryOwner={text('repo owner', defaultRepoOwner)}
      />
    ),
  });
};

export default {
  title: 'FilesView',
  decorators: [withKnobs],
  parameters: {
    notes: {
      markdown,
    },
  },
};
