import { Icon } from './Icon.jsx';

/**
 * One program tile. `description` is rendered only when the data file supplies
 * a non-empty one, and `showSubject` adds the subject name (used by search
 * results, where the subject is not obvious from context).
 */
export default function ProgramCard({ program, subjectName, showSubject = false }) {
  return (
    <article className="program-card">
      <a
        className="program-card-link"
        href={`#/subject/${program.subjectId}/program/${program.id}`}
      >
        <div className="program-card-head">
          <h3 className="program-card-title">{program.title}</h3>
          {program.language ? (
            <span className="badge badge--lang">{program.language}</span>
          ) : null}
        </div>
        {program.description ? (
          <p className="program-card-desc">{program.description}</p>
        ) : null}
        {showSubject && subjectName ? (
          <p className="program-card-subject">{subjectName}</p>
        ) : null}
        <span className="program-card-cta">
          View Code
          <Icon name="arrowRight" size={16} />
        </span>
      </a>
    </article>
  );
}
