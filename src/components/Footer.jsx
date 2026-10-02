import { Icon } from './Icon.jsx';

export default function Footer({ programCount, subjectCount }) {
  const programs = `${programCount} ${programCount === 1 ? 'program' : 'programs'}`;
  const subjects = `${subjectCount} ${subjectCount === 1 ? 'subject' : 'subjects'}`;

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="brand-mark brand-mark--small" aria-hidden="true">
            <Icon name="logo" size={16} />
          </span>
          <span className="footer-brand-name">CodeShelf</span>
        </div>
        <p className="footer-note">
          A static library of practical programs — {programs} across {subjects}. No
          backend, no sign-up, no tracking.
        </p>
        <p className="footer-note footer-note--muted">
          To publish another practical, add it to <code>src/data/programs.js</code>.
        </p>
      </div>
    </footer>
  );
}
