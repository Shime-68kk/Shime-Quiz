import { REVEAL_CHECK, REVEAL_INSTANT } from '../../cram/cramStorage.js';

// Two-option segmented control with the sliding glass thumb (see .cramSegment in cram.css).
export default function RevealToggle({ revealMode, onChange }) {
  return (
    <div
      className="cramSegment"
      role="radiogroup"
      aria-label="Cách hiện đáp án"
      style={{ '--seg-index': revealMode === REVEAL_INSTANT ? 1 : 0 }}
    >
      {[
        [REVEAL_CHECK, 'Bấm Kiểm tra'],
        [REVEAL_INSTANT, 'Hiện ngay']
      ].map(([mode, label]) => (
        <button
          key={mode}
          type="button"
          role="radio"
          aria-checked={revealMode === mode}
          className={`cramSegment__opt${revealMode === mode ? ' is-on' : ''}`}
          onClick={() => onChange(mode)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
