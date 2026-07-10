import { useId, useMemo, useState } from 'react';
import Badge from '../Badge.jsx';
import Button from '../Button.jsx';
import Card from '../Card.jsx';
import {
  MAX_DRAFT_ITEMS,
  MAX_FIELD_LENGTH,
  describeEdugenDraftError,
  describeEdugenDraftInvalidReason,
  parseEdugenDraftJson
} from '../../edugen/edugenDraftParser.js';
import { useShimeLanguage } from '../../uiI18n/useShimeLanguage.js';

const STATUS_IDLE = 'idle';
const STATUS_PREVIEW = 'preview';
const STATUS_SAVED = 'saved';

function clip(text, max = 240) {
  if (typeof text !== 'string') return '';
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

/**
 * Phase 16G — EduGen Draft Review Import Flow panel (Scope B: manual paste).
 *
 * Lets the user paste an EduGen JSON draft, runs a local parser/validator,
 * and renders a preview. No save happens until the user explicitly confirms.
 * Confirming only emits an `onConfirmImport` callback with the reviewed items.
 *
 * The panel does NOT call any network endpoint. It does NOT upload documents.
 * It does NOT touch the FSRS scheduler. It does NOT auto-enroll cards. It
 * does NOT mutate library state on its own — the parent controls persistence.
 */
export default function EduGenDraftReviewPanel({
  onConfirmImport,
  onCancel,
  defaultSourceName = ''
} = {}) {
  const { locale, t } = useShimeLanguage();
  const [draftText, setDraftText] = useState('');
  const [sourceName, setSourceName] = useState(defaultSourceName);
  const [status, setStatus] = useState(STATUS_IDLE);
  const [result, setResult] = useState(null);
  const [savedSummary, setSavedSummary] = useState(null);

  const textareaId = useId();
  const sourceId = useId();
  const helperId = useId();

  const isPreviewing = status === STATUS_PREVIEW;
  const isSaved = status === STATUS_SAVED;

  const previewItems = useMemo(() => {
    if (!result || !result.ok) return [];
    return result.items.slice(0, 5);
  }, [result]);

  function handleTextChange(event) {
    setDraftText(event.target.value);
    if (status !== STATUS_IDLE) {
      setStatus(STATUS_IDLE);
      setResult(null);
    }
  }

  function handleSourceChange(event) {
    setSourceName(event.target.value);
  }

  function handlePreview() {
    const parsed = parseEdugenDraftJson(draftText, { sourceName });
    setResult(parsed);
    setStatus(STATUS_PREVIEW);
    setSavedSummary(null);
  }

  function handleReset() {
    setDraftText('');
    setSourceName(defaultSourceName);
    setStatus(STATUS_IDLE);
    setResult(null);
    setSavedSummary(null);
    if (typeof onCancel === 'function') onCancel();
  }

  function handleLoadSample() {
    setDraftText(JSON.stringify({
      items: [{
        question: t('edugen.sampleQuestion'),
        answer: t('edugen.sampleAnswer'),
        source: t('edugen.sampleSource')
      }]
    }, null, 2));
    setStatus(STATUS_IDLE);
    setResult(null);
    setSavedSummary(null);
  }

  function handleConfirm() {
    if (!result || !result.ok) return;
    let importOutcome = null;
    if (typeof onConfirmImport === 'function') {
      try {
        importOutcome = onConfirmImport({
          items: result.items,
          summary: result.summary
        });
      } catch {
        // Parent failures must not crash the preview. The user can retry.
        return;
      }
    }
    const outcome = importOutcome && typeof importOutcome === 'object' ? importOutcome : null;
    setSavedSummary({
      count: outcome && Number.isFinite(outcome.addedCount)
        ? outcome.addedCount
        : result.items.length,
      duplicateCount: outcome && Number.isFinite(outcome.duplicateCount)
        ? outcome.duplicateCount
        : 0,
      persisted: outcome ? Boolean(outcome.persisted) : false,
      sourceName: result.summary.sourceName || sourceName.trim(),
      importedAt: result.summary.importedAt,
      message: outcome && typeof outcome.message === 'string' ? outcome.message : ''
    });
    setStatus(STATUS_SAVED);
  }

  function renderStatusBadge() {
    if (isSaved) {
      return <Badge tone="success">{t('edugen.saved')}</Badge>;
    }
    if (!result) {
      return <Badge tone="neutral">{t('edugen.notPreviewed')}</Badge>;
    }
    if (result.ok) {
      const allValid = result.invalid.length === 0;
      return (
        <Badge tone={allValid ? 'success' : 'warning'}>
          {allValid
            ? t('edugen.valid', { count: result.summary.validCount })
            : t('edugen.partlyValid', { valid: result.summary.validCount, total: result.summary.totalSubmitted })}
        </Badge>
      );
    }
    return <Badge tone="warning">{t('edugen.invalid')}</Badge>;
  }

  function renderErrorOrSummary() {
    if (isSaved && savedSummary) {
      if (savedSummary.persisted) {
        const dupeNote = savedSummary.duplicateCount > 0
          ? t('edugen.duplicatesSkipped', { count: savedSummary.duplicateCount })
          : '';
        return (
          <p className="settingsPanel__helper" role="status">
            {t('edugen.savedSuccess', { count: savedSummary.count })}{' '}
            {dupeNote} {t('edugen.schedulerUnchanged')}
          </p>
        );
      }
      return (
        <p className="settingsPanel__helper" role="status">
          {savedSummary.message ||
            t('edugen.recordedOnly', { count: savedSummary.count })}
        </p>
      );
    }
    if (!result) {
      return (
        <p className="settingsPanel__helperSecondary">
          {t('edugen.notPreviewedBody')}
        </p>
      );
    }
    if (!result.ok) {
      return (
        <p className="edugenDraftReview__error" role="alert">
          {locale === 'en' ? t('edugen.parseError', { code: result.error }) : describeEdugenDraftError(result.error)}
        </p>
      );
    }
    const { summary } = result;
    return (
      <p className="settingsPanel__helper">
        {t('edugen.summary', {
          total: summary.totalSubmitted,
          valid: summary.validCount,
          invalid: summary.invalidCount,
          characters: summary.totalCharacters
        })}
      </p>
    );
  }

  function renderPreviewItems() {
    if (!result || !result.ok || previewItems.length === 0) return null;
    return (
      <div className="edugenDraftReview__preview" aria-label={t('edugen.previewLabel')}>
        <h3 className="edugenDraftReview__previewTitle">{t('edugen.previewTitle')}</h3>
        <ol className="edugenDraftReview__list">
          {previewItems.map(item => (
            <li key={item.id} className="edugenDraftReview__item">
              <p className="edugenDraftReview__question">
                <strong>{t('edugen.question')}</strong> {clip(item.question)}
              </p>
              <p className="edugenDraftReview__answer">
                <strong>{t('edugen.answer')}</strong> {clip(item.answer)}
              </p>
              {item.sourceMetadata.sourceName && (
                <p className="edugenDraftReview__source">
                  {t('edugen.source')} {clip(item.sourceMetadata.sourceName, 80)}
                </p>
              )}
            </li>
          ))}
        </ol>
        {result.items.length > previewItems.length && (
          <p className="settingsPanel__helperSecondary">
            {t('edugen.moreItems', { count: result.items.length - previewItems.length })}
          </p>
        )}
      </div>
    );
  }

  function renderInvalidList() {
    if (!result || result.invalid.length === 0) return null;
    return (
      <div className="edugenDraftReview__invalid" aria-label={t('edugen.invalidLabel')}>
        <h3 className="edugenDraftReview__previewTitle">{t('edugen.invalidTitle', { count: result.invalid.length })}</h3>
        <ul className="edugenDraftReview__list">
          {result.invalid.slice(0, 5).map(entry => (
            <li key={`invalid-${entry.index}`} className="edugenDraftReview__itemInvalid">
              {t('edugen.invalidItem', {
                index: entry.index + 1,
                reason: locale === 'en' ? t('edugen.invalidReason', { code: entry.reason }) : describeEdugenDraftInvalidReason(entry.reason)
              })}
            </li>
          ))}
        </ul>
        {result.invalid.length > 5 && (
          <p className="settingsPanel__helperSecondary">
            {t('edugen.moreInvalid', { count: result.invalid.length - 5 })}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className="settingsPanel edugenDraftReview"
      aria-label={t('edugen.reviewLabel')}
    >
      <Card
        eyebrow={t('edugen.reviewEyebrow')}
        title={t('edugen.title')}
        variant="default"
      >
        <div className="settingsPanel__section">
          <p className="settingsPanel__helper">
            {t('edugen.reviewBody')}
          </p>
          <p className="settingsPanel__helperSecondary">
            {t('edugen.reviewCaution')}
          </p>

          <label className="edugenWorkshopPanel__fieldLabel" htmlFor={sourceId}>
            {t('edugen.sourceName')}
          </label>
          <input
            id={sourceId}
            type="text"
            value={sourceName}
            onChange={handleSourceChange}
            placeholder="ví dụ: chuong-3.pdf"
            spellCheck="false"
            autoComplete="off"
            maxLength={120}
            className="edugenWorkshopPanel__urlInput"
            aria-describedby={helperId}
          />

          <label className="edugenWorkshopPanel__fieldLabel" htmlFor={textareaId}>
            {t('edugen.pasteJson')}
          </label>
          <textarea
            id={textareaId}
            value={draftText}
            onChange={handleTextChange}
            rows={10}
            spellCheck="false"
            placeholder='{"items": [{"question": "...", "answer": "..."}]}'
            className="edugenDraftReview__textarea"
            aria-describedby={helperId}
          />
          <p id={helperId} className="settingsPanel__helperSecondary">
            {t('edugen.limits', { items: MAX_DRAFT_ITEMS, length: MAX_FIELD_LENGTH })}
          </p>

          <div className="edugenWorkshopPanel__actions">
            <Button
              type="button"
              variant="primary"
              onClick={handlePreview}
              disabled={!draftText.trim()}
            >
              {t('edugen.preview')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleConfirm}
              disabled={!isPreviewing || !result || !result.ok}
            >
              {t('edugen.confirm')}
            </Button>
            <Button type="button" variant="ghost" onClick={handleLoadSample}>
              {t('edugen.loadSample')}
            </Button>
            <Button type="button" variant="ghost" onClick={handleReset}>
              {t('edugen.clear')}
            </Button>
          </div>

          <div className="edugenWorkshopPanel__status" aria-live="polite">
            {renderStatusBadge()}
            {renderErrorOrSummary()}
          </div>

          {renderPreviewItems()}
          {renderInvalidList()}

          <ul className="edugenWorkshopPanel__guardrails">
            <li>{t('edugen.reviewGuard1')}</li>
            <li>{t('edugen.reviewGuard2')}</li>
            <li>{t('edugen.reviewGuard3')}</li>
            <li>{t('edugen.reviewGuard4')}</li>
            <li>{t('edugen.reviewGuard5')}</li>
            <li>{t('edugen.reviewGuard6')}</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
