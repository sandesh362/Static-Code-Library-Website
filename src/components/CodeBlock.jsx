import { useMemo } from 'react';
import { highlightLines, normalizeLanguage } from '../lib/highlight.js';

/**
 * Read-only, line-numbered, syntax-highlighted code block.
 *
 * The source is split into lines *after* tokenizing, so the text on screen is
 * always exactly the string from the data file — highlighting only wraps it in
 * spans, it never rewrites it.
 */
export default function CodeBlock({ code, language, label }) {
  const lines = useMemo(
    () => highlightLines(code, normalizeLanguage(language)),
    [code, language]
  );

  const gutterWidth = Math.max(2, String(lines.length).length);

  return (
    <pre
      className="code-pre"
      tabIndex={0}
      role="region"
      aria-label={label || 'Source code'}
    >
      <code className="code-rows" style={{ '--gutter': gutterWidth }}>
        {lines.map((tokens, lineIndex) => (
          <span className="code-row" key={lineIndex}>
            <span className="code-ln" aria-hidden="true">
              {lineIndex + 1}
            </span>
            <span className="code-line">
              {tokens.map((token, tokenIndex) => (
                <span key={tokenIndex} className={`tok tok-${token.type}`}>
                  {token.value}
                </span>
              ))}
            </span>
          </span>
        ))}
      </code>
    </pre>
  );
}
