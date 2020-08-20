import React from 'react';
import SearchResultComponent from '.';
import 'storybook/global';
import markdown from './README.md';
import { wrapRootElement } from 'storybook/rootWrapper';
import { text, withKnobs, select } from '@storybook/addon-knobs';
import { ResultType, PreviewFieldsFragment } from 'lib/generated/datamodel';
import { ExtendedLanguage } from 'components/codeHighlight';

const languageOptions: ExtendedLanguage[] = ['java'];

const defaultPreview = `package test;
public class Test {
  public static void main(String[] args) {
    System.out.println("Hello World!");
  }
}`;

export const SearchResult = (): JSX.Element => {
  const previewText = text('preview', defaultPreview);
  const getPreviewData = (): PreviewFieldsFragment => {
    const splitText = previewText.split('\n');
    return {
      startPreviewLineNumber: 0,
      endPreviewLineNumber: splitText.length,
      startPreviewContent: splitText,
      endPreviewContent: [],
    };
  };
  return wrapRootElement({
    element: (
      <SearchResultComponent
        name={text('result name', 'testFunc')}
        language={select<ExtendedLanguage>(
          'language',
          languageOptions,
          languageOptions[0]
        )}
        type={ResultType.Function}
        preview={getPreviewData()}
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
