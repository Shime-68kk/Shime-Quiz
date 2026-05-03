export default function Toast({ title, description, tone = 'info' }) {
  return (
    <div className={`toast toast--${tone}`} role="status" aria-live="polite">
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
