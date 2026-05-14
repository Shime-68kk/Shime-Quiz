// Phase 14N — Production memory rating bridge (presentation only).
// Rendered by StudyRoom only when shouldShowFsrsTwoStepBridge() is true.
// Does not import scheduling, storage, or ts-fsrs modules.
// User-facing copy avoids the word "FSRS".

const RATING_DESCRIPTIONS = {
  Hard: 'Recalled with serious effort.',
  Good: 'Recalled with normal effort.',
  Easy: 'Instant recall.'
};

function RatingButton({ label, description, onClick, disabled }) {
  const descId = `bridge-rating-desc-${label.toLowerCase()}`;
  return (
    <button
      type="button"
      className={`memoryBridge__ratingBtn memoryBridge__ratingBtn--${label.toLowerCase()}`}
      onClick={onClick}
      disabled={disabled}
      aria-describedby={descId}
    >
      {label}
      <span id={descId} className="memoryBridge__ratingDesc">{description}</span>
    </button>
  );
}

// objectiveCorrect: true (correct) | false (wrong) | null (flashcard/unknown → effort path)
// bridgeState: undefined (pending) | { phase: 'auto-again'|'rated'|'skipped', rating }
// onSelectRating(rating: 'Hard'|'Good'|'Easy'): called when user picks a rating
// onSkip(): called when user clicks Continue without rating
export default function FsrsProductionMemoryRatingBridge({
  objectiveCorrect,
  bridgeState,
  onSelectRating,
  onSkip
}) {
  const isWrong = objectiveCorrect === false;
  const phase = bridgeState?.phase || (isWrong ? 'auto-again' : 'awaiting-effort');
  const rated = phase === 'rated';
  const skipped = phase === 'skipped';

  if (skipped) return null;

  return (
    <section
      className="memoryBridge"
      role="region"
      aria-label="Experimental memory rating"
    >
      <p className="memoryBridge__header">Experimental: memory rating</p>
      <p className="memoryBridge__safetyNote">
        Your study schedule is not changed by this rating yet.
      </p>

      {phase === 'auto-again' && (
        <div className="memoryBridge__autoAgain" aria-live="polite">
          <p className="memoryBridge__autoAgainText">
            Needs another review. Your study schedule is not changed by this rating yet.
          </p>
        </div>
      )}

      {phase === 'awaiting-effort' && (
        <div className="memoryBridge__effortGroup">
          <p className="memoryBridge__effortPrompt">How did this recall feel?</p>
          <div className="memoryBridge__ratingBtnGroup" role="group" aria-label="Memory effort rating">
            {Object.entries(RATING_DESCRIPTIONS).map(([label, description]) => (
              <RatingButton
                key={label}
                label={label}
                description={description}
                onClick={() => onSelectRating(label)}
              />
            ))}
          </div>
          <button
            type="button"
            className="memoryBridge__skipBtn"
            onClick={onSkip}
          >
            Continue without rating
          </button>
        </div>
      )}

      {rated && (
        <div className="memoryBridge__rated" aria-live="polite">
          <p className="memoryBridge__ratedText">
            Recorded <strong>{bridgeState.rating}</strong>. Your schedule is not affected.
          </p>
        </div>
      )}
    </section>
  );
}
