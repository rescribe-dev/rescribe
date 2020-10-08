import React from 'react';
import { Row, Col } from 'reactstrap';
import Highlight, {
  defaultProps as defaultHighlightProps,
  Language,
} from 'prism-react-renderer';
import githubTheme from 'prism-react-renderer/themes/github';

export type ExtendedLanguage = Language | 'java';

const CodeHighlight = (args: {
  code: string[];
  startIndex: number;
  language: ExtendedLanguage;
}): JSX.Element => {
  return (
    <Highlight
      {...defaultHighlightProps}
      code={args.code.join('\n')}
      language={(args.language as unknown) as Language}
      theme={githubTheme}
    >
      {({ className, style, tokens, getTokenProps }) => (
        <pre //The box containing it all
          className={className}
          style={{
            ...style,
            textAlign: 'left',
            margin: '0.2em 0',
            padding: '0.1em',
            overflow: 'hideen',
            backgroundColor: 'var(--code-bg)',
            boxSizing: 'initial',
          }}
        >
          {tokens.map((line, i) => (
            <Row //The line of Code (Prism handles all of this)
              style={{
                margin: '0px',
              }}
              key={i}
            >
              <Col
                xs="1" //The line number
                css={{
                  display: 'table-cell',
                  textAlign: 'center',
                  paddingRight: '1em',
                  userSelect: 'none',
                  opacity: '0.5',
                }}
                style={{
                  color: 'var(--line-num)',
                  width: '4em',
                }}
              >
                <b>{i + 1 + args.startIndex}</b>
              </Col>
              <Col
                md="7" //The normal code on the page
                style={{
                  display: 'inline',
                  paddingLeft: '4em',
                }}
              >
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </Col>
            </Row>
          ))}
        </pre>
      )}
    </Highlight>
  );
};

export default CodeHighlight;
