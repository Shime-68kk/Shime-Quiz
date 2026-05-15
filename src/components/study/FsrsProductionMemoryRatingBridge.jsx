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

// Phase 16A — Vietnamese-first UX copy. The visible rating text leads with
// Vietnamese phrasing the user actually reads; the original English
// description follows in muted style so Phase 15F claim-safety assertions
// and historical validators continue to find their reference wording.
const RATING_DESCRIPTIONS = {
  Hard: {
    label: 'Nhớ khó',
    helper: 'Recalled with serious effort.'
  },
  Good: {
    label: 'Nhớ được',
    helper: 'Recalled with normal effort.'
  },
  Easy: {
    label: 'Nhớ dễ',
    helper: 'Instant recall.'
  }
};

function RatingButton({ ratingKey, label, helper, onClick, disabled }) {
  const descId = `bridge-rating-desc-${ratingKey.toLowerCase()}`;
  return (
    <button
      type="button"
      className={`memoryBridge__ratingBtn memoryBridge__ratingBtn--${ratingKey.toLowerCase()}`}
      onClick={onClick}
      disabled={disabled}
      aria-describedby={descId}
    >
      <span className="memoryBridge__ratingLabel">
        <span className="memoryBridge__ratingLabelPrimary">{label}</span>
        <span className="memoryBridge__ratingLabelSecondary">{ratingKey}</span>
      </span>
      <span id={descId} className="memoryBridge__ratingDesc">{helper}</span>
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

  const headerNoteVi = activeCopy
    ? 'Có thể điều chỉnh khi bạn gặp lại thẻ này.'
    : 'Lịch học hiện tại chưa bị thay đổi.';
  const headerNoteEn = activeCopy
    ? 'This rating may adjust when you next see this card.'
    : 'Your study schedule is not changed by this rating yet.';

  const autoAgainVi = activeCopy
    ? 'Chưa nhớ — đã ghi nhận Chưa nhớ. Có thể điều chỉnh khi bạn gặp lại thẻ này.'
    : 'Cần ôn lại. Lịch học hiện tại chưa bị thay đổi.';
  const autoAgainEn = activeCopy
    ? 'Not recalled — recorded as Again. This may adjust when you next see this card.'
    : 'Needs another review. Your study schedule is not changed by this rating yet.';

  const skipHelpVi = activeCopy
    ? 'Tiếp tục không đánh giá vẫn giữ cập nhật ôn tập bình thường cho câu này.'
    : 'Tiếp tục không đánh giá không thay đổi lịch học của bạn.';
  const skipHelpEn = activeCopy
    ? 'Continue without rating keeps the normal review update for this answer.'
    : 'Continue without rating leaves your study schedule unchanged.';

  return (
    <section
      className="memoryBridge"
      role="region"
      aria-label="Đánh giá mức độ nhớ thử nghiệm"
    >
      <p className="memoryBridge__header">
        <span className="memoryBridge__headerPrimary">Mức độ nhớ thử nghiệm</span>
        <span className="memoryBridge__headerSecondary">Experimental: memory rating</span>
      </p>
      <p className="memoryBridge__safetyNote">
        <span className="memoryBridge__safetyNotePrimary">{headerNoteVi}</span>
        <span className="memoryBridge__safetyNoteSecondary">{headerNoteEn}</span>
      </p>

      {phase === 'auto-again' && (
        <div className="memoryBridge__autoAgain" aria-live="polite">
          <p className="memoryBridge__autoAgainText">
            <span className="memoryBridge__autoAgainTextPrimary">{autoAgainVi}</span>
            <span className="memoryBridge__autoAgainTextSecondary">{autoAgainEn}</span>
          </p>
        </div>
      )}

      {phase === 'awaiting-effort' && (
        <div className="memoryBridge__effortGroup">
          <p className="memoryBridge__effortPrompt">
            <span className="memoryBridge__effortPromptPrimary">Bạn nhớ câu này như thế nào?</span>
            <span className="memoryBridge__effortPromptSecondary">How did this recall feel?</span>
          </p>
          <div className="memoryBridge__ratingBtnGroup" role="group" aria-label="Mức độ nhớ theo cảm nhận">
            {Object.entries(RATING_DESCRIPTIONS).map(([ratingKey, info]) => (
              <RatingButton
                key={ratingKey}
                ratingKey={ratingKey}
                label={info.label}
                helper={info.helper}
                onClick={() => onSelectRating(ratingKey)}
              />
            ))}
          </div>
          <button
            type="button"
            className="memoryBridge__skipBtn"
            onClick={onSkip}
          >
            <span className="memoryBridge__skipBtnPrimary">Tiếp tục không đánh giá</span>
            <span className="memoryBridge__skipBtnSecondary">Continue without rating</span>
          </button>
          <p className="memoryBridge__skipHelp">
            <span className="memoryBridge__skipHelpPrimary">{skipHelpVi}</span>
            <span className="memoryBridge__skipHelpSecondary">{skipHelpEn}</span>
          </p>
        </div>
      )}

      {rated && (
        <div className="memoryBridge__rated" aria-live="polite">
          {activeCopy ? (
            <p className="memoryBridge__ratedText">
              <span className="memoryBridge__ratedTextPrimary">
                Đã ghi nhận <strong>{bridgeState.rating}</strong>. Có thể điều chỉnh khi bạn gặp lại thẻ này.
              </span>
              <span className="memoryBridge__ratedTextSecondary">
                Recorded <strong>{bridgeState.rating}</strong>. This may adjust when you next see this card.
              </span>
            </p>
          ) : (
            <p className="memoryBridge__ratedText">
              <span className="memoryBridge__ratedTextPrimary">
                Đã ghi nhận <strong>{bridgeState.rating}</strong>. Lịch học của bạn không bị thay đổi.
              </span>
              <span className="memoryBridge__ratedTextSecondary">
                Recorded <strong>{bridgeState.rating}</strong>. Your schedule is not affected.
              </span>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
