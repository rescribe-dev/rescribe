import React from 'react';
import { FileResultComponent } from '.';
import 'storybook/global';
import markdown from './README.md';
import { wrapRootElement } from 'storybook/rootWrapper';
import { text, withKnobs, select, number } from '@storybook/addon-knobs';
import { Language, ResultType } from 'lib/generated/datamodel';
import ObjectId from 'bson-objectid';

const languageOptions: Language[] = [Language.Java];
const resultTypeOptions: ResultType[] = [ResultType.Class];

const defaultPreview = `package test;
public class Test {
  public static void main(String[] args) {
    System.out.println("Hello World!");
  }
}`;

export const FileResult = (): JSX.Element => {
  return wrapRootElement({
    element: (
      <FileResultComponent
        file={{
          _id: new ObjectId(),
          language: {
            color: number('color', 0xffffff),
            name: select<Language>(
              'language',
              languageOptions,
              languageOptions[0]
            )
          },
          lines: {
            start: number('start line', 1),
            end: number('end line', 5)
          },
          name: text('file name', 'the file'),
          location: {
            image: text('repo image', 'https://example.com/image.jpg'),
            owner: text('owner', 'me'),
            repository: text('repository', 'repo')
          },
          path: '/folder1/test.java'
        }}
        previewSearchResults={[{
          name: text('preview name', 'preview'),
          type: select<ResultType>(
            'preview result type',
            resultTypeOptions,
            resultTypeOptions[0]
          )
        }]}
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
