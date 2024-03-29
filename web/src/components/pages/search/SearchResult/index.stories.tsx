import React from 'react';
import SearchResultComponent from '.';
import 'storybook/global';
import markdown from './README.md';
import { wrapRootElement } from 'storybook/rootWrapper';
import { withKnobs, select } from '@storybook/addon-knobs';
import { ResultType } from 'lib/generated/datamodel';
import { ExtendedLanguage } from 'components/codeHighlight';
import { defaultPreview, getPreviewData } from '../FileResult/storyUtils';

const languageOptions: ExtendedLanguage[] = ['java'];

export const SearchResult = (): JSX.Element => {
  return wrapRootElement({
    element: (
      <SearchResultComponent
        name="hello"
        language={select<ExtendedLanguage>(
          'language',
          languageOptions,
          languageOptions[0]
        )}
        type={ResultType.Function}
        preview={getPreviewData(defaultPreview)}
      />
    ),
  });
};

export default {
  title: 'SearchResult',
  decorators: [withKnobs],
  parameters: {
    notes: {
      markdown,
    },
  },
};
