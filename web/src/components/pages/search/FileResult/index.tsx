import React from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  CardText,
  Media,
  Row,
  Col,
} from 'reactstrap';
import {
  ResultFieldsFragment,
  FileFieldsFragment,
} from 'lib/generated/datamodel';
import { Language } from 'prism-react-renderer';
import SearchResultComponent from '../SearchResult';
import './styles.scss';
import { Link } from 'gatsby';
import { LazyLoadImage } from 'react-lazy-load-image-component';

export interface FileResultCardArgs {
  file: FileFieldsFragment;
  previewSearchResults: ResultFieldsFragment[];
}

export const FileResultComponent = (args: FileResultCardArgs): JSX.Element => {
  return (
    <Card className="search-result-card">
      <CardBody>
        <CardTitle>
          <Row>
            <Col md="1" className="vertical-center">
              <LazyLoadImage
                src={args.file.location.image}
                style={{
                  width: '2em',
                  height: '2em',
                  borderRadius: '1em',
                }}
              />
            </Col>
            <Col md="10" className="align-items-start justify-content-end">
              <Row>
                <Col>
                  <Row>
                    <Col>
                      <CardText>{args.file.name}</CardText>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <CardText
                        style={{
                          display: 'inline',
                        }}
                      >
                        <b>
                          {args.file.location.repository}/
                          {args.file.location.owner}
                        </b>
                        {' > '}
                      </CardText>
                      <Link
                        to="/"
                        style={{
                          color: 'var(--link-blue)',
                        }}
                      >
                        {args.file.path}
                      </Link>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
            <Col md="1">
              <Row className="align-items-center justify-content-center no-gutters">
                <Col xs="3" className="align-items-flex-end">
                  <Media
                    style={{
                      backgroundColor: args.file.language.darkColor,
                      height: '1em',
                      width: '1em',
                      borderRadius: '0.5em',
                    }}
                  ></Media>
                </Col>
                <Col xs="8">
                  <CardText>{args.file.language.name}</CardText>
                </Col>
              </Row>
            </Col>
          </Row>
        </CardTitle>
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
