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
import { getAPIURL } from 'utils/axios';

export interface FileResultCardArgs {
  file: FileFieldsFragment;
  previewSearchResults: ResultFieldsFragment[];
}

export const FileResultComponent = (args: FileResultCardArgs): JSX.Element => {
  return (
    <Card className="search-result-card w-100">
      <CardBody>
        <CardTitle>
          <Row>
            <Col md="1">
              <img
                src={`${getAPIURL()}/media/${args.file.location.image}`}
                style={{
                  width: '2em',
                  height: '2em',
                  borderRadius: '1em',
                }}
              />
            </Col>
            <Col>
              <Row>
                <Col>
                  <Row>
                    <Col>
                      <CardText>{args.file.name}</CardText>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Row>
                        <Col xs="auto" className="pr-0">
                          <CardText>
                            <Link
                              to={`/${args.file.location.owner}/${args.file.location.repository}`}
                            >
                              <div className="button-link text-dark">
                                <b>
                                  {args.file.location.owner}/
                                  {args.file.location.repository}
                                </b>
                                {' > '}
                              </div>
                            </Link>
                          </CardText>
                        </Col>
                        <Col>
                          <Link
                            to={`/${args.file.location.owner}/${args.file.location.repository}/tree/master${args.file.path}${args.file.name}`}
                            style={{
                              color: 'var(--link-blue)',
                            }}
                            className="text-break"
                          >
                            {args.file.path}
                            {args.file.name}
                          </Link>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
            <Col md="2">
              <Row className="align-items-center justify-content-start no-gutters">
                <Col xs="auto" className="align-items-flex-end mr-2">
                  <Media
                    style={{
                      backgroundColor: args.file.language.darkColor,
                      height: '1em',
                      width: '1em',
                      borderRadius: '0.5em',
                    }}
                  />
                </Col>
                <Col xs="auto">
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
