export default function EmptyState({ title, description, action, icon = '○' }) {
  return (
    <div className="emptyState">
      <div className="emptyState__icon" aria-hidden="true">{icon}</div>
      <h2 className="emptyState__title">{title}</h2>
      {description ? <p className="emptyState__description">{description}</p> : null}
      {action ? <div className="emptyState__action">{action}</div> : null}
    </div>
  );
}
