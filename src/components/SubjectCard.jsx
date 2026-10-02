import { Icon } from './Icon.jsx';
import { accentStyle } from '../lib/accents.js';

/** One subject tile on the home page. The whole tile is a link. */
export default function SubjectCard({ subject, programCount }) {
  return (
    <article className="subject-card" style={accentStyle(subject.accent)}>
      <a className="subject-card-link" href={`#/subject/${subject.id}`}>
        <span className="subject-card-top">
          <span className="subject-card-icon" aria-hidden="true">
            <Icon name={subject.icon || 'other'} size={22} />
          </span>
          <span className="subject-card-arrow" aria-hidden="true">
            <Icon name="arrowRight" size={18} />
          </span>
        </span>
        <div className="subject-card-body">
          <h3 className="subject-card-title">{subject.name}</h3>
          <p className="subject-card-meta">
            {programCount} {programCount === 1 ? 'program' : 'programs'}
          </p>
        </div>
      </a>
    </article>
  );
}
