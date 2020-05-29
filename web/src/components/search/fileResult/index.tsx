import React from 'react';
import { Card, CardBody, CardTitle } from 'reactstrap';
import {
  ResultFieldsFragment,
  FileFieldsFragment,
} from '../../../lib/generated/datamodel';
import { Language } from 'prism-react-renderer';
import { SearchResultComponent } from '../searchResult';
import './styles.scss';

export interface FileResultCardArgs {
  file: FileFieldsFragment;
  previewSearchResults: ResultFieldsFragment[];
}

export const FileResultComponent = (args: FileResultCardArgs) => {
  return (
    <Card className="search-result-card">
      <CardBody>
        <CardTitle>{args.file.name}</CardTitle>
        {args.previewSearchResults.map((result, index) => {
          return (
            <SearchResultComponent
              key={`result-${result.type}-${index}`}
              language={args.file.language.name as Language}
              result={result}
            />
          );
        })}
      </CardBody>
    </Card>
  );
};
