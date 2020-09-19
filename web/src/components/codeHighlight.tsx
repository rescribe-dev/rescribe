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
        <pre //The box containing it all
          className={className}
          style={{
            ...style,
            textAlign: 'left',
            margin: '0.2em 0',
            padding: '0.1em',
            overflow: 'hideen',
            backgroundColor: 'var(--code-bg)',
            boxSizing: 'initial'
          }}
        >
          {tokens.map((line, i) => (
            <div //The line of Code (Prism handles all of this)
              key={i}
              style={{
                display: 'table-row',
              }}
              {...getLineProps({ line, key: i })}
            >
              <span //The line number
                css={{
                  display: 'table-cell',
                  textAlign: 'right',
                  paddingRight: '1em',
                  userSelect: 'none',
                  opacity: '0.5',
                }}
                style = {{
                  color: 'var(--line-num)'
                }}
              >
                <b>{i + 1 + args.startIndex}</b>
              </span>
              <span //The normal code on the page
                style={{
                  display: 'inline',
                  paddingLeft: '4em',
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
