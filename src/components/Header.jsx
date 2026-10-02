import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon.jsx';
import { subjects } from '../data/programs.js';

/**
 * Sticky site header with the brand mark and a primary nav built from the
 * subjects in the data file. On narrow screens the nav collapses behind a
 * toggle button (Escape / outside-click / route change closes it).
 */
export default function Header({ activeSubjectId }) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const navRef = useRef(null);

  // Any navigation closes the mobile menu.
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener('hashchange', close);
    return () => window.removeEventListener('hashchange', close);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointerDown = (event) => {
      if (!navRef.current?.contains(event.target) && !toggleRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="#/" aria-label="CodeShelf — go to home page">
          <span className="brand-mark" aria-hidden="true">
            <Icon name="logo" size={20} />
          </span>
          <span className="brand-name">CodeShelf</span>
        </a>

        <button
          ref={toggleRef}
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <Icon name={open ? 'close' : 'menu'} size={20} />
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        </button>

        <nav
          id="primary-nav"
          ref={navRef}
          className={`primary-nav${open ? ' is-open' : ''}`}
          aria-label="Primary"
        >
          <ul className="nav-list">
            <li>
              <a
                className="nav-link"
                href="#/"
                aria-current={activeSubjectId ? undefined : 'page'}
              >
                Home
              </a>
            </li>
            {subjects.map((subject) => (
              <li key={subject.id}>
                <a
                  className="nav-link"
                  href={`#/subject/${subject.id}`}
                  aria-current={activeSubjectId === subject.id ? 'page' : undefined}
                >
                  <Icon name={subject.icon || 'other'} size={16} className="nav-link-icon" />
                  {subject.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
