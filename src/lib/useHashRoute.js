import { useEffect, useState } from 'react';

/**
 * Tiny hash-based router — no dependency, and it works when the site is
 * served from a sub-folder or a static host with no rewrite rules.
 *
 *   #/                                  -> { name: 'home' }
 *   #/subject/operating-system          -> { name: 'subject', subjectId }
 *   #/subject/os/program/fifo           -> { name: 'program', subjectId, programId }
 *   anything else                       -> { name: 'not-found' }
 *
 * @returns {{name: string, subjectId?: string, programId?: string}}
 */
export function parseHash(hash) {
  const raw = String(hash || '').replace(/^#/, '');
  const path = raw.split('?')[0].replace(/\/+$/, '');
  const parts = path.split('/').filter(Boolean);

  if (parts.length === 0) return { name: 'home' };

  if (parts[0] === 'subject' && parts.length >= 2) {
    const subjectId = decodeURIComponent(parts[1]);
    if (parts.length === 2) return { name: 'subject', subjectId };
    if (parts[2] === 'program' && parts.length >= 4) {
      return {
        name: 'program',
        subjectId,
        programId: decodeURIComponent(parts[3]),
      };
    }
  }

  return { name: 'not-found' };
}

/** Subscribe to `hashchange` and return the parsed route. */
export function useHashRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}

/** Programmatic navigation that always plays nicely with browser history. */
export function navigate(hash) {
  if (window.location.hash === hash) {
    // Same target: still let listeners re-render (e.g. re-selecting a subject).
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    return;
  }
  window.location.hash = hash;
}

/** Move the viewport to the top whenever the route changes. */
export function useScrollToTop(dependency) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [dependency]);
}
