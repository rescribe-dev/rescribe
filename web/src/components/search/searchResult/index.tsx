import React from 'react';
import { Container } from 'reactstrap';
import { ResultFieldsFragment } from '../../../lib/generated/datamodel';
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
  result: ResultFieldsFragment;
  language: Language;
}

export const SearchResultComponent = (args: SearchResultCardArgs) => {
  return (
    <Container>
      <CodeHighlight
        code={args.result.startPreviewContent}
        language={args.language}
      />
      <p>...</p>
      <CodeHighlight
        code={args.result.endPreviewContent}
        language={args.language}
      />
    </Container>
  );
};
