import React, { useState } from 'react';
import { Container, CardText, Card, CardBody } from 'reactstrap';
import { ResultType, PreviewFieldsFragment } from 'lib/generated/datamodel';
import './styles.scss';
import { Link } from 'gatsby';
import CodeHighlight, { ExtendedLanguage } from 'components/codeHighlight';
import { Col, Row, Tooltip } from 'reactstrap';

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
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggle = () => setTooltipOpen(!tooltipOpen);
  return (
    <Container>
      <Card>
        <CardText className="text-right"
        style={{position:'absolute', right:'100px', top:'20px', color:'var(--gray4)', fontStyle:'italic'}}
        > {args.type}{' > '}{args.name} </CardText>
        <CardBody>
          <CodeHighlight
            startIndex={args.preview.startPreviewLineNumber}
            code={args.preview.startPreviewContent}
            language={args.language}
          />
          <Row
            style={{
              textAlign: 'left',
              margin: '0.2em 0',
              padding: '0.1em',
              overflow: 'hideen',
              backgroundColor: 'var(--code-bg)',
              boxSizing: 'initial',
            }}
          >
            <Col xs="1">
              <p>∧</p>
              <p>∨</p>
            </Col>
            <Col xs="1"></Col>
            <Col md="7">
              <Link
                id="test"
                to="/search#"
                style={{
                  fontSize: '2em',
                  fontWeight: 'bolder',
                }}
              >
                ...
              </Link>
              <Tooltip
                placement="right"
                isOpen={tooltipOpen}
                target="test"
                toggle={toggle}
              >
                {args.preview.endPreviewLineNumber -
                  args.preview.startPreviewLineNumber -
                  args.preview.startPreviewContent.length}
              </Tooltip>
            </Col>
          </Row>

          <CodeHighlight
            startIndex={args.preview.endPreviewLineNumber}
            code={args.preview.endPreviewContent}
            language={args.language}
          />
        </CardBody>
      </Card>
    </Container>
  );
};

export default SearchResultComponent;
