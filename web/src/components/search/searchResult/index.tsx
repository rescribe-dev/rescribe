import React from 'react';
import { Container, CardText, Card, CardBody } from 'reactstrap';
import {
  ResultType,
  PreviewFieldsFragment,
} from '../../../lib/generated/datamodel';
import Highlight, {
  defaultProps as defaultHighlightProps,
  Language,
} from 'prism-react-renderer';
import githubTheme from 'prism-react-renderer/themes/github';

import './styles.scss';
import { Link } from 'gatsby';

const CodeHighlight = (args: {
  code: string[];
  startIndex: number;
  language: Language;
}): JSX.Element => {
  return (
    <Highlight
      {...defaultHighlightProps}
      code={args.code.join('\n')}
      language={args.language}
      theme={githubTheme}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={className}
          style={{
            ...style,
            textAlign: 'left',
            margin: '1em 0',
            padding: '0.5em',
            overflow: 'scroll',
          }}
        >
          {tokens.map((line, i) => (
            <div
              key={i}
              style={{
                display: 'table-row',
              }}
              {...getLineProps({ line, key: i })}
            >
              <span
                css={{
                  display: 'table-cell',
                  textAlign: 'right',
                  paddingRight: '1em',
                  userSelect: 'none',
                  opacity: '0.5',
                }}
              >
                {i + args.startIndex}
              </span>
              <span
                style={{
                  display: 'table-cell',
                }}
              >
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </span>
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
};

export interface SearchResultCardArgs {
  name: string;
  type: ResultType;
  preview?: PreviewFieldsFragment | null;
  language: Language;
}

export const SearchResultComponent = (args: SearchResultCardArgs) => {
  if (!args.preview) {
    return <div>no preview content</div>;
  }
  return (
    <Container>
      <Card>
        <CardBody>
          {args.preview.startPreviewContent.length > 0 ? (
            <>
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
