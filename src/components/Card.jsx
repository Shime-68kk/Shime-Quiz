export default function Card({
  title,
  eyebrow,
  children,
  variant = 'default',
  interactive = false,
  className = '',
  as: Component = 'section',
  ...props
}) {
  const classes = [
    'card',
    `card--${variant}`,
    interactive ? 'card--interactive' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <Component className={classes} {...props}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      {title ? <h2 className="card__title">{title}</h2> : null}
      <div className="card__body">{children}</div>
    </Component>
  );
}
