import React from 'react';
import ThemeSelectorComponent from '.';
import 'storybook/global';
import markdown from './README.md';
import { wrapRootElement } from 'storybook/rootWrapper';
import { withKnobs } from '@storybook/addon-knobs';

export const ThemeSelector = (): JSX.Element => {
  return wrapRootElement({
    element: <ThemeSelectorComponent />,
  });
};

export default {
  title: 'ThemeSelector',
  decorators: [withKnobs],
  parameters: {
    notes: {
      markdown,
    },
  },
};
