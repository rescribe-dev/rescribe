import React from 'react';
import HeaderComponent from '.';
import 'storybook/global';
import markdown from './README.md';
import { wrapRootElement } from 'storybook/rootWrapper';
import { text, withKnobs } from '@storybook/addon-knobs';

export const Header = (): JSX.Element => {
  const currentPath = text('path', '/');
  return wrapRootElement({
    element: <HeaderComponent location={currentPath} />,
  });
};

export default {
  title: 'Header',
  decorators: [withKnobs],
  parameters: {
    notes: {
      markdown,
    },
  },
};
