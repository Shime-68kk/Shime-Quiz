// Phase 14N — Production memory rating bridge (presentation only).
// Rendered by StudyRoom only when shouldShowFsrsTwoStepBridge() is true.
// User-facing copy avoids the word "FSRS".
//
// Phase 15F — Study Room copy / UX alignment for active scheduling.
// The bridge renders one of two claim-safe copy variants:
//   - default OFF inert copy (Phase 14N wording verbatim)
//   - internal-active copy that says ratings may adjust when you next
//     see this card
// The variant is selected from the context-eligible prop combined with
// the active-scheduling flag read from runtime settings. The internal
// flag identifier is never rendered as user-facing text and is never
// promoted to a public rollout claim.

import { getSettings } from '../../state/settingsStorage.js';

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

function isActiveSchedulingCopyOn({
  isActiveSchedulingCopyContextEligible,
  isActiveSchedulingCopyEnabled
}) {
  if (isActiveSchedulingCopyEnabled === true) return true;
  if (isActiveSchedulingCopyEnabled === false) return false;
  if (isActiveSchedulingCopyContextEligible === false) return false;
  try {
    return getSettings().fsrsActiveSchedulingEnabled === true;
  } catch {
    return false;
  }
}

// objectiveCorrect: true (correct) | false (wrong) | null (flashcard/unknown → effort path)
// bridgeState: undefined (pending) | { phase: 'auto-again'|'rated'|'skipped', rating }
// onSelectRating(rating: 'Hard'|'Good'|'Easy'): called when user picks a rating
// onSkip(): called when user clicks Continue without rating
// isActiveSchedulingCopyContextEligible (Phase 15F, optional):
//   StudyRoom-supplied boolean indicating the bridge is shown and the
//   experimental toggle is on. When false, the bridge stays in default
//   inert copy mode regardless of the internal active flag.
// isActiveSchedulingCopyEnabled (Phase 15F, optional, test-only override):
//   When explicitly true or false, forces the corresponding copy mode
//   without reading runtime settings.
export default function FsrsProductionMemoryRatingBridge({
  objectiveCorrect,
  bridgeState,
  onSelectRating,
  onSkip,
  isActiveSchedulingCopyContextEligible,
  isActiveSchedulingCopyEnabled
}) {
  const isWrong = objectiveCorrect === false;
  const phase = bridgeState?.phase || (isWrong ? 'auto-again' : 'awaiting-effort');
  const rated = phase === 'rated';
  const skipped = phase === 'skipped';

  if (skipped) return null;

  const activeCopy = isActiveSchedulingCopyOn({
    isActiveSchedulingCopyContextEligible,
    isActiveSchedulingCopyEnabled
  });

  const headerNote = activeCopy
    ? 'This rating may adjust when you next see this card.'
    : 'Your study schedule is not changed by this rating yet.';

  const autoAgainText = activeCopy
    ? 'Not recalled — recorded as Again. This may adjust when you next see this card.'
    : 'Needs another review. Your study schedule is not changed by this rating yet.';

  const skipHelpText = activeCopy
    ? 'Continue without rating keeps the normal review update for this answer.'
    : 'Continue without rating leaves your study schedule unchanged.';

  return (
    <section
      className="memoryBridge"
      role="region"
      aria-label="Experimental memory rating"
    >
      <p className="memoryBridge__header">Experimental: memory rating</p>
      <p className="memoryBridge__safetyNote">{headerNote}</p>

      {phase === 'auto-again' && (
        <div className="memoryBridge__autoAgain" aria-live="polite">
          <p className="memoryBridge__autoAgainText">{autoAgainText}</p>
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
          <p className="memoryBridge__skipHelp">{skipHelpText}</p>
        </div>
      )}

      {rated && (
        <div className="memoryBridge__rated" aria-live="polite">
          {activeCopy ? (
            <p className="memoryBridge__ratedText">
              Recorded <strong>{bridgeState.rating}</strong>. This may adjust when you next see this card.
            </p>
          ) : (
            <p className="memoryBridge__ratedText">
              Recorded <strong>{bridgeState.rating}</strong>. Your schedule is not affected.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
