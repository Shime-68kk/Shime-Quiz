import { useId } from 'react';

export default function PageHeader({ eyebrow, title, subtitle, actions, compact = false }) {
  const titleId = useId();

  return (
    <section className={compact ? 'pageHeader pageHeader--compact' : 'pageHeader'} aria-labelledby={titleId}>
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 id={titleId}>{title}</h1>
        {subtitle ? <p className="lead">{subtitle}</p> : null}
      </div>
      {actions ? <div className="pageHeader__actions">{actions}</div> : null}
    </section>
  );
}
