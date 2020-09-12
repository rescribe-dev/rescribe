import React from 'react';
import { Container, CardText, Card, CardBody } from 'reactstrap';
import { ResultType, PreviewFieldsFragment } from 'lib/generated/datamodel';
import './styles.scss';
import { Link } from 'gatsby';
import CodeHighlight, { ExtendedLanguage } from 'components/codeHighlight';

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
        <CardBody>
          {args.preview.startPreviewContent.length > 0 ? (
            <>
              <CardText>User image</CardText>
              <CardText>name: {args.name}</CardText>
              <CardText>type: {args.type}</CardText>
              <CodeHighlight
                startIndex={args.preview.startPreviewLineNumber}
                code={args.preview.startPreviewContent}
                language={args.language}
              />
              <Link to="/search#">...</Link>
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
