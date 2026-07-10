const PATHS = {
  sample: <><path d="m13 2-1.2 5.1a2 2 0 0 1-1.5 1.5L5.2 10 10 11.2a2 2 0 0 1 1.5 1.5l1.4 5.1 1.2-5.1a2 2 0 0 1 1.5-1.5l5.2-1.3-5.2-1.3a2 2 0 0 1-1.5-1.5z" /><path d="m5 16-.6 2.1a1 1 0 0 1-.7.7l-2.2.6 2.2.6a1 1 0 0 1 .7.7L5 23l.6-2.3a1 1 0 0 1 .7-.7l2.2-.6-2.2-.6a1 1 0 0 1-.7-.7z" /></>,
  paste: <><path d="M9 5h6" /><path d="M9 9h6" /><path d="M9 13h4" /><path d="M5 3h14v18H5z" /></>,
  file: <><path d="M4 4h6l2 3h8v13H4z" /><path d="M12 11v6" /><path d="m9.5 13.5 2.5-2.5 2.5 2.5" /></>,
  template: <><path d="M4 5h16v14H4z" /><path d="M8 9h8" /><path d="M8 13h5" /><path d="M17 13h.01" /></>,
  search: <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>
};

export default function LibraryMethodIcon({ type, label }) {
  const informative = Boolean(label);
  return (
    <svg
      className="libraryMethodIcon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={informative ? undefined : 'true'}
      role={informative ? 'img' : undefined}
      aria-label={informative ? label : undefined}
      focusable="false"
    >
      {PATHS[type] || PATHS.file}
    </svg>
  );
}

