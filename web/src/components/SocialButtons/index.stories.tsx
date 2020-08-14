import React from 'react';
import SocialButtonsComponent from '.';
import 'storybook/global';
import markdown from './README.md';
import { wrapRootElement } from 'storybook/rootWrapper';
import { withKnobs, text, select } from '@storybook/addon-knobs';

const defaultPath = '/signup';
const signupPath = defaultPath;

const paths = [defaultPath, '/login'];

export const SocialButtons = (): JSX.Element => {
  const currentPath = select<string>('path', paths, defaultPath);
  const currentQueryStr = text('query', '?');
  return wrapRootElement({
    element: (
      <SocialButtonsComponent
        location={currentPath + currentQueryStr}
        signUp={currentPath === signupPath}
      />
    ),
  });
};

export default {
  title: 'SocialButtons',
  decorators: [withKnobs],
  parameters: {
    notes: {
      markdown,
    },
  },
};
