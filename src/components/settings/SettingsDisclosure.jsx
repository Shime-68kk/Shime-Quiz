import { useId, useState } from 'react';

export default function SettingsDisclosure({ title, description, tone = 'advanced', children }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <section className={`settingsGroup settingsGroup--${tone}`}>
      <button
        type="button"
        className="settingsGroup__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(current => !current)}
      >
        <span>
          <strong>{title}</strong>
          <small>{description}</small>
        </span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m8 10 4 4 4-4" />
        </svg>
      </button>
      <div id={panelId} className="settingsGroup__content" hidden={!open}>
        {children}
      </div>
    </section>
  );
}

