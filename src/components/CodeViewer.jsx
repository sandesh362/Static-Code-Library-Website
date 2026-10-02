import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from './Icon.jsx';
import CodeBlock from './CodeBlock.jsx';
import { copyText } from '../lib/copyToClipboard.js';

/** Program → full source with copy, language, filename and line numbers. */
export default function CodeViewer({ program, subject }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'copied' | 'error'
  const timerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const handleCopy = useCallback(async () => {
    const result = await copyText(program.code);
    setStatus(result.ok ? 'copied' : 'error');
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setStatus('idle'), 2600);
  }, [program.code]);

  const subjectHref = `#/subject/${subject.id}`;
  const lineCount = program.code.split('\n').length;
  const copied = status === 'copied';

  /** `variant: 'desktop'` hides the button on phones, where the fixed bar owns it. */
  const copyButton = (variant) => (
    <button
      type="button"
      className={[
        'btn',
        'btn--primary',
        'copy-button',
        variant === 'desktop' ? 'copy-button--desktop' : '',
        copied ? 'is-copied' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleCopy}
      data-state={status}
    >
      <Icon name={copied ? 'check' : 'copy'} size={16} />
      <span className="copy-button-label">{copied ? 'Copied!' : 'Copy Code'}</span>
    </button>
  );

  const backLink = (
    <a className="btn btn--ghost" href={subjectHref}>
      <Icon name="arrowLeft" size={16} />
      Back to {subject.name}
    </a>
  );

  return (
    <article className="code-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol className="breadcrumb-list">
          <li>
            <a href="#/">Home</a>
          </li>
          <li aria-hidden="true" className="breadcrumb-sep">
            <Icon name="chevronRight" size={14} />
          </li>
          <li>
            <a href={subjectHref}>{subject.name}</a>
          </li>
          <li aria-hidden="true" className="breadcrumb-sep">
            <Icon name="chevronRight" size={14} />
          </li>
          <li>
            <span aria-current="page">{program.title}</span>
          </li>
        </ol>
      </nav>

      <header className="code-header">
        <h1 className="code-title">{program.title}</h1>
        <div className="code-meta">
          {program.language ? (
            <span className="badge badge--lang">{program.language}</span>
          ) : null}
          {program.filename ? (
            <span className="code-filename">
              <Icon name="fileCode" size={15} />
              {program.filename}
            </span>
          ) : null}
          <span className="code-lines">{lineCount} lines</span>
          <a className="code-subject-link" href={subjectHref}>
            {subject.name}
            <Icon name="chevronRight" size={14} />
          </a>
        </div>
        {program.description ? (
          <p className="code-description">{program.description}</p>
        ) : null}
      </header>

      <div className="code-toolbar">
        {backLink}
        {copyButton('desktop')}
      </div>

      <section className="code-panel" aria-label={`Source code of ${program.title}`}>
        <div className="code-panel-bar">
          <span className="code-panel-name">
            <Icon name="fileCode" size={15} />
            {program.filename || program.title}
          </span>
          {program.language ? (
            <span className="badge badge--lang badge--sm">{program.language}</span>
          ) : null}
        </div>
        <CodeBlock
          code={program.code}
          language={program.language}
          label={`Source code of ${program.title}${
            program.filename ? ` (${program.filename})` : ''
          }`}
        />
      </section>

      <div className="code-footer">{backLink}</div>

      {/* Thumb-reachable copy / back on phones (hidden on wider screens). */}
      <div className="mobile-action-bar">
        <a className="btn btn--ghost btn--block" href={subjectHref}>
          <Icon name="arrowLeft" size={16} />
          Back
        </a>
        {copyButton()}
      </div>

      <p className="sr-only" role="status">
        {copied
          ? 'Source code copied to clipboard'
          : status === 'error'
            ? 'Could not copy automatically. Select the code and press Control or Command C.'
            : ''}
      </p>
    </article>
  );
}
