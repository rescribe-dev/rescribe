import React from 'react';
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
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={className}
          style={{
            ...style,
            textAlign: 'left',
            margin: '1em 0',
            padding: '0.5em',
            overflow: 'scroll',
            backgroundColor: 'var(--code-bg)',
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
                <b>{i + 1 + args.startIndex}</b>
              </span>
              <span
                style={{
                  display: 'inline',
                  paddingLeft: '1em',
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

export default CodeHighlight;
