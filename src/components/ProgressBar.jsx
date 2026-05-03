export default function ProgressBar({ value = 0, label, showValue = true }) {
  const normalizedValue = Math.min(100, Math.max(0, Number(value) || 0));
  const accessibleLabel = label || 'Tiến độ';

  return (
    <div className="progressBlock">
      <div className="progressBlock__meta">
        <span>{accessibleLabel}</span>
        {showValue ? <strong>{Math.round(normalizedValue)}%</strong> : null}
      </div>
      <div
        className="progressBar"
        role="progressbar"
        aria-label={accessibleLabel}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={Math.round(normalizedValue)}
      >
        <span className="progressBar__fill" style={{ width: `${normalizedValue}%` }} />
      </div>
    </div>
  );
}
