import React from 'react';
import { Container } from 'reactstrap';
import {
  ResultType,
  PreviewFieldsFragment,
} from '../../../lib/generated/datamodel';
import Highlight, {
  defaultProps as defaultHighlightProps,
  Language,
} from 'prism-react-renderer';

import './styles.scss';

/* eslint-disable react/jsx-key */

const CodeHighlight = (args: {
  code: string[];
  language: Language;
}): JSX.Element => {
  return (
    <Highlight
      {...defaultHighlightProps}
      code={args.code.join('\n')}
      language={args.language}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={style}>
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
};

/* eslint-enable react/jsx-key */

export interface SearchResultCardArgs {
  name: string;
  type: ResultType;
  index: number;
  preview?: PreviewFieldsFragment | null;
  language: Language;
}

export const SearchResultComponent = (args: SearchResultCardArgs) => {
  if (!args.preview) {
    return <div>no preview content</div>;
  }
  return (
    <Container>
      <CodeHighlight
        code={args.preview.startPreviewContent}
        language={args.language}
      />
      {args.preview.endPreviewContent.length > 0 ? (
        [
          <p key={`preview-dots-${args.index}`}>...</p>,
          <CodeHighlight
            key={`code-highlight-${args.index}`}
            code={args.preview.endPreviewContent}
            language={args.language}
          />,
        ]
      ) : (
        <></>
      )}
    </Container>
  );
};
