import React from 'react';
import { Container, CardText, Card, CardBody } from 'reactstrap';
import { ResultType, PreviewFieldsFragment } from 'lib/generated/datamodel';
import './styles.scss';
import { Link } from 'gatsby';
import CodeHighlight, { ExtendedLanguage } from 'components/codeHighlight';
import {Col, Row} from 'reactstrap';

export interface SearchResultCardArgs {
  name: string;
  type: ResultType;
  preview?: PreviewFieldsFragment | null;
  language: ExtendedLanguage;
}

const SearchResultComponent = (args: SearchResultCardArgs): JSX.Element => {
  if (!args.preview) {
    return <div>no preview content</div>;
  }
  return (
    <Container>
      <Card>
        <CardText>name: {args.name}</CardText>
        <CardText>type: {args.type}</CardText>
        <CardBody>
          {args.preview.startPreviewContent.length > 0 ? (
            <>
              <CodeHighlight
                startIndex={args.preview.startPreviewLineNumber}
                code={args.preview.startPreviewContent}
                language={args.language}
              />
              <Row style={{
                margin: "0em 0em",
                padding: "0.2em 0.5em"
              }}>
                <Col md="2" style={{
                  padding: "0em 15px 0em 0em"
                }}>
                  <p style={{
                    margin: '0px'
                  }}>∧</p><p style={{
                    margin: '0px'
                  }}>∨</p> 
                </Col>
                <Col md="6" style={{
                  display: "flex",
                  flexFlow: "column nowrap",
                  justifyContent: "center"
                }}>
                  <Link to="/search#" style={{
                    fontSize: "2em",
                    fontWeight: "bolder"
                  }}>...</Link>
                </Col>
              </Row>
              {args.preview.endPreviewContent.length > 0 ? (
                <CodeHighlight
                  startIndex={args.preview.endPreviewLineNumber}
                  code={args.preview.endPreviewContent}
                  language={args.language}
                />
              ) : (
                <></>
              )}
            </>
          ) : (
            <p>no preview available</p>
          )}
        </CardBody>
      </Card>
    </Container>
  );
};

export default SearchResultComponent;
