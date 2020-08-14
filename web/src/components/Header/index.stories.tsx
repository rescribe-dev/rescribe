import React from 'react';
import HeaderComponent from '.';
import 'storybook/global';
import markdown from './README.md';
import { wrapRootElement } from 'storybook/rootWrapper';

export const Header = (): JSX.Element =>
  wrapRootElement({
    element: <HeaderComponent location="/about" />,
  });

export default {
  title: 'Header',
  parameters: {
    notes: {
      markdown,
    },
  },
};
