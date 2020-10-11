import React from 'react';
import { FileResultComponent } from '.';
import 'storybook/global';
import markdown from './README.md';
import { wrapRootElement } from 'storybook/rootWrapper';
import { text, withKnobs, select, number, color } from '@storybook/addon-knobs';
import { Language, ResultType } from 'lib/generated/datamodel';
import ObjectId from 'bson-objectid';
import hexRGB from 'hex-rgb';
import rgbHex from 'rgb2hex';
import { defaultPreview, getPreviewData } from './storyUtils';

const languageOptions: Language[] = [Language.Java];
const resultTypeOptions: ResultType[] = Object.keys(ResultType).map(
  (type) => ResultType[type as keyof typeof ResultType]
);

export const FileResult = (): JSX.Element => {
  const previewText = text('preview', defaultPreview);

  const getColor = (): string => {
    const selectedColor = color(
      'language color',
      hexRGB('#f0ad4e', {
        format: 'css',
      })
        .trim()
        .replaceAll(' ', ',')
    );
    console.log(selectedColor);
    const hexVal = rgbHex(selectedColor).hex;
    console.log(hexVal);
    return hexVal;
  };
  return wrapRootElement({
    element: (
      <FileResultComponent
        file={{
          _id: new ObjectId(),
          language: {
            color: getColor(),
            name: select<Language>(
              'language',
              languageOptions,
              languageOptions[0]
            ),
          },
          lines: {
            start: number('start line', 1),
            end: number('end line', 5),
          },
          name: text('file name', 'the file'),
          location: {
            image: text('repo image', 'https://i.stack.imgur.com/frlIf.png'),
            owner: text('owner', 'me'),
            repository: text('repository', 'repo'),
          },
          path: '/folder1/test.java',
        }}
        previewSearchResults={[
          {
            name: text('preview name', 'preview'),
            type: select<ResultType>(
              'preview result type',
              resultTypeOptions,
              resultTypeOptions[0]
            ),
            preview: getPreviewData(previewText),
          },
        ]}
      />
    ),
  });
};

export default {
  title: 'FileResult',
  decorators: [withKnobs],
  parameters: {
    notes: {
      markdown,
    },
  },
};
