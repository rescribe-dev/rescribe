import React from 'react';
import { Card, CardBody, CardTitle, CardText, Media, Row, Col } from 'reactstrap';
import {
  ResultFieldsFragment,
  FileFieldsFragment,
} from 'lib/generated/datamodel';
import { Language } from 'prism-react-renderer';
import SearchResultComponent from '../SearchResult';
import './styles.scss';
import { borderRadius } from 'react-select/src/theme';

export interface FileResultCardArgs {
  file: FileFieldsFragment;
  previewSearchResults: ResultFieldsFragment[];
}

export const FileResultComponent = (args: FileResultCardArgs): JSX.Element => {
  return (
    <Card className="search-result-card">
      <CardBody>
<<<<<<< Updated upstream
        <CardTitle>{args.file.name}</CardTitle>
        <CardText>{args.file.language.color}</CardText>
        <CardText>written in {args.file.language.name}</CardText>
        <CardText>path: {args.file.path}</CardText>
        <CardText>
          location: {args.file.location.repository}/{args.file.location.owner}
        </CardText>
=======
        <CardTitle>
          <Row>
            <Media object data-src={args.file.location.image} alt="Generic placeholder image" />
            <Col>
              <CardText>{args.file.name}</CardText>
              <Row>
                  <b>{args.file.location.repository}/{args.file.location.owner}</b>{" > "}
                  <p style={{
                    color: 'var(--link-blue)'
                  }}>{args.file.path}</p>
              </Row>
            </Col>
            <Row>
              <Media style = {{
                backgroundColor: 'var(--light-orange)',
                height: '1em',
                width: '1em',
                borderRadius: '0.5em'
              }}></Media>
              <CardText>{args.file.language.name}</CardText>
            </Row>
          </Row>
        </CardTitle>
>>>>>>> Stashed changes
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
