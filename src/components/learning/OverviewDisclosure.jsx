import { useId, useState } from 'react';

export default function OverviewDisclosure({
  title,
  description,
  level = 'advanced',
  defaultOpen = false,
  children
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = `overview-disclosure-${useId().replace(/:/g, '')}`;

  return (
    <section className={`overviewDisclosure overviewDisclosure--${level}`} data-overview-level={level}>
      <button
        type="button"
        className="overviewDisclosure__trigger"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen(current => !current)}
      >
        <span>
          <strong>{title}</strong>
          {description ? <small>{description}</small> : null}
        </span>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="m7 10 5 5 5-5" />
        </svg>
      </button>
      <div id={contentId} className="overviewDisclosure__content" hidden={!open}>
        {children}
      </div>
    </section>
  );
}
