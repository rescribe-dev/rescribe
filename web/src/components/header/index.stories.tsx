import React from 'react';
import HeaderComponent from '.';
import '../../storybook/global';
// @ts-ignore
import markdown from './README.md';

export const Header = (): JSX.Element => <HeaderComponent location={'/'} />;

export default {
  title: 'Header',
  parameters: {
    notes: {
      markdown,
    },
  },
};
