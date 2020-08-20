import React from 'react';
import LanguageSelectorComponent from '.';
import 'storybook/global';
import markdown from './README.md';
import { wrapRootElement } from 'storybook/rootWrapper';
import { withKnobs } from '@storybook/addon-knobs';

export const LanguageSelector = (): JSX.Element => {
  return wrapRootElement({
    element: <LanguageSelectorComponent />,
  });
};

export default {
  title: 'LanguageSelector',
  decorators: [withKnobs],
  parameters: {
    notes: {
      markdown,
    },
  },
};
