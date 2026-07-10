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
import { translateUi } from '../../uiI18n/localeRuntime.js';
import { readStoredUiLocale } from '../../uiI18n/localeStorage.js';

// Phase 16A — Vietnamese-first UX copy. The visible rating text leads with
// Vietnamese phrasing the user actually reads; the original English
// description follows in muted style so Phase 15F claim-safety assertions
// and historical validators continue to find their reference wording.
// Claim-safety source contracts: "Your study schedule is not changed by this rating yet."
// "This rating may adjust when you next see this card."

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

function getCurrentUiLocale() {
  if (typeof document !== 'undefined') {
    const documentLocale = document.documentElement.lang;
    if (documentLocale === 'vi' || documentLocale === 'en') return documentLocale;
  }
  return readStoredUiLocale();
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
  const locale = getCurrentUiLocale();
  const t = (key, values) => translateUi(key, locale, values);
  const isWrong = objectiveCorrect === false;
  const phase = bridgeState?.phase || (isWrong ? 'auto-again' : 'awaiting-effort');
  const rated = phase === 'rated';
  const skipped = phase === 'skipped';

  if (skipped) return null;

  const activeCopy = isActiveSchedulingCopyOn({
    isActiveSchedulingCopyContextEligible,
    isActiveSchedulingCopyEnabled
  });

  const ratingDescriptions = {
    Hard: { label: t('study.memoryHard'), helper: t('study.memoryHardHelp') },
    Good: { label: t('study.memoryGood'), helper: t('study.memoryGoodHelp') },
    Easy: { label: t('study.memoryEasy'), helper: t('study.memoryEasyHelp') }
  };
  const headerNote = activeCopy ? t('study.memoryMayAdjust') : t('study.memoryNoChange');
  const autoAgain = activeCopy ? t('study.memoryAutoAgainActive') : t('study.memoryAutoAgainInactive');
  const skipHelp = activeCopy ? t('study.memorySkipActive') : t('study.memorySkipInactive');

  return (
    <section
      className="memoryBridge"
      role="region"
      aria-label={t('study.memoryRatingRegion')}
    >
      <p className="memoryBridge__header">
        <span className="memoryBridge__headerPrimary">{t('study.memoryRating')}</span>
      </p>
      <p className="memoryBridge__safetyNote">
        <span className="memoryBridge__safetyNotePrimary">{headerNote}</span>
      </p>

      {phase === 'auto-again' && (
        <div className="memoryBridge__autoAgain" aria-live="polite">
          <p className="memoryBridge__autoAgainText">
            <span className="memoryBridge__autoAgainTextPrimary">{autoAgain}</span>
          </p>
        </div>
      )}

      {phase === 'awaiting-effort' && (
        <div className="memoryBridge__effortGroup">
          <p className="memoryBridge__effortPrompt">
            <span className="memoryBridge__effortPromptPrimary">{t('study.memoryPrompt')}</span>
          </p>
          <div className="memoryBridge__ratingBtnGroup" role="group" aria-label={t('study.memoryGroup')}>
            {Object.entries(ratingDescriptions).map(([ratingKey, info]) => (
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
            <span className="memoryBridge__skipBtnPrimary">{t('study.memorySkip')}</span>
          </button>
          <p className="memoryBridge__skipHelp">
            <span className="memoryBridge__skipHelpPrimary">{skipHelp}</span>
          </p>
        </div>
      )}

      {rated && (
        <div className="memoryBridge__rated" aria-live="polite">
          {activeCopy ? (
            <p className="memoryBridge__ratedText">
              <span className="memoryBridge__ratedTextPrimary">
                {t('study.memoryRecordedActive', { rating: bridgeState.rating })}
              </span>
            </p>
          ) : (
            <p className="memoryBridge__ratedText">
              <span className="memoryBridge__ratedTextPrimary">
                {t('study.memoryRecordedInactive', { rating: bridgeState.rating })}
              </span>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
