/**
 * Inline SVG icon set — no icon font, no network request, no dependency.
 * Every icon inherits `currentColor` and a 1.7px stroke so it matches the
 * surrounding text colour automatically.
 */

const PATHS = {
  // brand mark: angle brackets sitting on a shelf
  logo: (
    <>
      <path d="M9.6 7.6 6 12l3.6 4.4" />
      <path d="M14.4 7.6 18 12l-3.6 4.4" />
      <path d="M4.5 20.5h15" />
    </>
  ),
  os: (
    <>
      <rect x="4.5" y="4.5" width="15" height="15" rx="2.5" />
      <rect x="9.2" y="9.2" width="5.6" height="5.6" rx="1" />
      <path d="M9.5 2.5v2M14.5 2.5v2M9.5 19.5v2M14.5 19.5v2M2.5 9.5h2M2.5 14.5h2M19.5 9.5h2M19.5 14.5h2" />
    </>
  ),
  dsa: (
    <>
      <circle cx="12" cy="5" r="2.2" />
      <circle cx="5.5" cy="18.5" r="2.2" />
      <circle cx="18.5" cy="18.5" r="2.2" />
      <path d="M12 7.2v3.6M11.1 10.4 6.9 16.4M12.9 10.4l4.2 6" />
    </>
  ),
  cn: (
    <>
      <circle cx="12" cy="5" r="2.2" />
      <circle cx="5.5" cy="18.5" r="2.2" />
      <circle cx="18.5" cy="18.5" r="2.2" />
      <path d="M12 7.2v3.4M11.2 10.3 6.6 16.5M12.8 10.3l4.6 6.2" />
    </>
  ),
  dbms: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6" />
      <path d="M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
    </>
  ),
  other: (
    <>
      <path d="M9.2 8.2 5.6 12l3.6 3.8" />
      <path d="M14.8 8.2 18.4 12l-3.6 3.8" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.4" />
      <path d="M15.8 15.8 20.5 20.5" />
    </>
  ),
  close: <path d="M6.4 6.4l11.2 11.2M17.6 6.4 6.4 17.6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  copy: (
    <>
      <rect x="9" y="9" width="11.5" height="11.5" rx="2.2" />
      <path d="M5.4 15H4.6A1.6 1.6 0 0 1 3 13.4V4.6A1.6 1.6 0 0 1 4.6 3h8.8A1.6 1.6 0 0 1 15 4.6v.8" />
    </>
  ),
  check: <path d="M4.8 12.6 9.6 17.4 19.2 6.8" />,
  alert: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.6v5" />
      <path d="M12 16.1v.3" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="M20 12H4.2" />
      <path d="M10.4 5.4 4 12l6.4 6.6" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M4 12h15.8" />
      <path d="M13.6 5.4 20 12l-6.4 6.6" />
    </>
  ),
  chevronRight: <path d="M9.5 5.5l6.5 6.5-6.5 6.5" />,
  fileCode: (
    <>
      <path d="M14 3.2H7.4A2.2 2.2 0 0 0 5.2 5.4v13.2a2.2 2.2 0 0 0 2.2 2.2h9.2a2.2 2.2 0 0 0 2.2-2.2V8z" />
      <path d="M14 3.2V8h4.8" />
      <path d="M10.2 12.4 8.6 14l1.6 1.6M13.8 12.4 15.4 14l-1.6 1.6" />
    </>
  ),
};

/**
 * @param {{name: keyof typeof PATHS, size?: number, className?: string, title?: string}} props
 */
export function Icon({ name, size = 20, className = '', title }) {
  const shape = PATHS[name] || PATHS.other;
  return (
    <svg
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {shape}
    </svg>
  );
}
