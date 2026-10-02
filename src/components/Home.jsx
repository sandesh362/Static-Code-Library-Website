import { useEffect, useMemo, useRef } from 'react';
import SearchBar from './SearchBar.jsx';
import SubjectCard from './SubjectCard.jsx';
import ProgramCard from './ProgramCard.jsx';
import { programs, programsBySubject, subjects } from '../data/programs.js';
import { searchPrograms } from '../lib/search.js';
import { navigate } from '../lib/useHashRoute.js';

const SUBJECTS_BY_ID = Object.fromEntries(subjects.map((subject) => [subject.id, subject]));

/** Home → hero + search + subject grid (or search results). */
export default function Home({ query, onQueryChange }) {
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const results = useMemo(
    () => searchPrograms(programs, SUBJECTS_BY_ID, query),
    [query]
  );
  const hasQuery = query.trim().length > 0;

  // "/" jumps to the search field; Escape clears it.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (event.key === '/' && !isTyping) {
        event.preventDefault();
        inputRef.current?.focus();
        return;
      }
      if (event.key === 'Escape' && isTyping && query) {
        onQueryChange('');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [query, onQueryChange]);

  const focusFirstResult = () => {
    const first = resultsRef.current?.querySelector('.program-card-link');
    if (first instanceof HTMLElement) first.focus();
  };

  const onResultsKeyDown = (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const links = Array.from(
      resultsRef.current?.querySelectorAll('.program-card-link') || []
    ).filter((link) => link instanceof HTMLElement);
    if (links.length === 0) return;
    event.preventDefault();
    const current = links.indexOf(document.activeElement);
    const next =
      event.key === 'ArrowDown'
        ? (current + 1) % links.length
        : current <= 0
          ? links.length - 1
          : current - 1;
    links[next].focus();
  };

  return (
    <div className="home">
      <section className="hero">
        <h1 className="hero-title">Your Practical Code Library</h1>
        <p className="hero-subtitle">
          Find, read and copy the full source code of your college practical
          programs — organised by subject and ready to paste straight into your
          submissions.
        </p>

        <div className="hero-search">
          <SearchBar
            id="home-search"
            ref={inputRef}
            value={query}
            onChange={onQueryChange}
            showShortcut
            placeholder="Search programs, subjects or filenames…"
            label="Search programs"
            onSubmit={() => {
              if (results.length === 1) {
                navigate(`#/subject/${results[0].subjectId}/program/${results[0].id}`);
              } else if (results.length > 1) {
                focusFirstResult();
              }
            }}
          />
        </div>

        <p className="hero-hint">
          <span>
            <kbd>/</kbd> to search · <kbd>Esc</kbd> to clear
          </span>
          <span className="hero-hint-dot" aria-hidden="true">
            ·
          </span>
          <span>
            {programs.length} {programs.length === 1 ? 'program' : 'programs'} in{' '}
            {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'}
          </span>
        </p>
      </section>

      {hasQuery ? (
        <section className="section" aria-labelledby="results-heading">
          <div className="section-head">
            <h2 className="section-title" id="results-heading">
              Search results
            </h2>
            <p className="section-count" role="status">
              {results.length === 0
                ? `No programs match “${query.trim()}”`
                : `${results.length} ${results.length === 1 ? 'match' : 'matches'} for “${query.trim()}”`}
            </p>
          </div>

          {results.length > 0 ? (
            <div className="program-grid" ref={resultsRef} onKeyDown={onResultsKeyDown}>
              {results.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  subjectName={SUBJECTS_BY_ID[program.subjectId]?.name}
                  showSubject
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p className="empty-state-title">Nothing found</p>
              <p className="empty-state-text">
                Nothing in this library matches that keyword. Try a shorter
                word, or clear the search to browse every subject.
              </p>
              <button type="button" className="btn btn--ghost" onClick={() => onQueryChange('')}>
                Clear search
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="section" aria-labelledby="subjects-heading">
          <div className="section-head">
            <h2 className="section-title" id="subjects-heading">
              Browse by subject
            </h2>
            <p className="section-count">
              Pick a subject to see its programs
            </p>
          </div>

          <div className="subject-grid">
            {programsBySubject.map(({ subject, programs: subjectPrograms }) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                programCount={subjectPrograms.length}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
