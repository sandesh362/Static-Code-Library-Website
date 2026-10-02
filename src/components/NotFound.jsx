import { Icon } from './Icon.jsx';

export default function NotFound({ title, message }) {
  return (
    <div className="empty-state empty-state--page">
      <span className="empty-state-icon" aria-hidden="true">
        <Icon name="alert" size={22} />
      </span>
      <h1 className="empty-state-title">{title}</h1>
      <p className="empty-state-text">{message}</p>
      <a className="btn btn--primary" href="#/">
        <Icon name="arrowLeft" size={16} />
        Back to home
      </a>
    </div>
  );
}
