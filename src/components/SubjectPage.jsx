import { useMemo, useState } from 'react';
import { Icon } from './Icon.jsx';
import SearchBar from './SearchBar.jsx';
import ProgramCard from './ProgramCard.jsx';
import { getProgramsForSubject } from '../data/programs.js';
import { searchPrograms } from '../lib/search.js';
import { accentStyle } from '../lib/accents.js';

/** Subject → list of that subject's programs. */
export default function SubjectPage({ subject }) {
  const [filter, setFilter] = useState('');

  const allPrograms = useMemo(() => getProgramsForSubject(subject.id), [subject.id]);
  const subjectsById = useMemo(() => ({ [subject.id]: subject }), [subject]);
  const visiblePrograms = useMemo(
    () =>
      filter.trim()
        ? searchPrograms(allPrograms, subjectsById, filter)
        : allPrograms,
    [allPrograms, subjectsById, filter]
  );

  const hasFilter = filter.trim().length > 0;

  return (
    <article className="subject-page" style={accentStyle(subject.accent)}>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol className="breadcrumb-list">
          <li>
            <a href="#/">Home</a>
          </li>
          <li aria-hidden="true" className="breadcrumb-sep">
            <Icon name="chevronRight" size={14} />
          </li>
          <li>
            <span aria-current="page">{subject.name}</span>
          </li>
        </ol>
      </nav>

      <header className="subject-header">
        <span className="subject-header-icon" aria-hidden="true">
          <Icon name={subject.icon || 'other'} size={24} />
        </span>
        <div className="subject-header-text">
          <h1 className="subject-title">{subject.name}</h1>
          <p className="subject-meta">
            {allPrograms.length} {allPrograms.length === 1 ? 'program' : 'programs'}
          </p>
        </div>
      </header>

      {subject.description ? (
        <p className="subject-description">{subject.description}</p>
      ) : null}

      {allPrograms.length > 1 ? (
        <div className="subject-filter">
          <SearchBar
            id={`filter-${subject.id}`}
            value={filter}
            onChange={setFilter}
            placeholder={`Filter ${subject.name} programs…`}
            label={`Filter programs in ${subject.name}`}
          />
        </div>
      ) : null}

      <div className="section-head section-head--tight">
        <h2 className="section-title section-title--sm">Programs</h2>
        {hasFilter ? (
          <p className="section-count" role="status">
            {visiblePrograms.length === 0
              ? 'No matches'
              : `${visiblePrograms.length} of ${allPrograms.length} shown`}
          </p>
        ) : null}
      </div>

      {visiblePrograms.length > 0 ? (
        <div className="program-grid">
          {visiblePrograms.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p className="empty-state-title">No programs match “{filter.trim()}”</p>
          <button type="button" className="btn btn--ghost" onClick={() => setFilter('')}>
            Clear filter
          </button>
        </div>
      )}
    </article>
  );
}
