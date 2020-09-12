import React from 'react';
import CurrencySelectorComponent from '.';
import 'storybook/global';
import markdown from './README.md';
import { wrapRootElement } from 'storybook/rootWrapper';
import { withKnobs, boolean } from '@storybook/addon-knobs';

export const CurrencySelector = (): JSX.Element => {
  return wrapRootElement({
    element: (
      <CurrencySelectorComponent
        displayCurrency={boolean('set payment currency', true)}
      />
    ),
  });
};

export default {
  title: 'CurrencySelector',
  decorators: [withKnobs],
  parameters: {
    notes: {
      markdown,
    },
  },
};
