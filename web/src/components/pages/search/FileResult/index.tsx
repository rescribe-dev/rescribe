import React from 'react';
import { Card, CardBody, CardTitle, CardText } from 'reactstrap';
import {
  ResultFieldsFragment,
  FileFieldsFragment,
} from 'lib/generated/datamodel';
import { Language } from 'prism-react-renderer';
import { SearchResultComponent } from '../SearchResult';
import './styles.scss';

export interface FileResultCardArgs {
  file: FileFieldsFragment;
  previewSearchResults: ResultFieldsFragment[];
}

export const FileResultComponent = (args: FileResultCardArgs): JSX.Element => {
  return (
    <Card className="search-result-card">
      <CardBody>
        <CardTitle>{args.file.name}</CardTitle>
        <CardText>written in {args.file.language.name}</CardText>
        <CardText>path: {args.file.path}</CardText>
        <CardText>
          location: {args.file.location.repository}/{args.file.location.owner}
        </CardText>
        {args.previewSearchResults.map((result, index) => {
          return (
            <SearchResultComponent
              key={`result-${result.type}-${index}`}
              language={args.file.language.name as Language}
              name={result.name}
              preview={result.preview}
              type={result.type}
            />
          );
        })}
      </CardBody>
    </Card>
  );
};
