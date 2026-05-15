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

const STATUS_IDLE = 'idle';
const STATUS_PREVIEW = 'preview';
const STATUS_SAVED = 'saved';

const SAMPLE_TEMPLATE = JSON.stringify(
  {
    items: [
      {
        question: 'Câu hỏi mẫu (sửa lại trước khi lưu)',
        answer: 'Đáp án mẫu (sửa lại trước khi lưu)',
        source: 'Tên tài liệu của bạn'
      }
    ]
  },
  null,
  2
);

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
    setDraftText(SAMPLE_TEMPLATE);
    setStatus(STATUS_IDLE);
    setResult(null);
    setSavedSummary(null);
  }

  function handleConfirm() {
    if (!result || !result.ok) return;
    if (typeof onConfirmImport === 'function') {
      try {
        onConfirmImport({
          items: result.items,
          summary: result.summary
        });
      } catch {
        // Parent failures must not crash the preview. The user can retry.
        return;
      }
    }
    setSavedSummary({
      count: result.items.length,
      sourceName: result.summary.sourceName || sourceName.trim(),
      importedAt: result.summary.importedAt
    });
    setStatus(STATUS_SAVED);
  }

  function renderStatusBadge() {
    if (isSaved) {
      return <Badge tone="success">Đã xác nhận lưu</Badge>;
    }
    if (!result) {
      return <Badge tone="neutral">Chưa xem trước</Badge>;
    }
    if (result.ok) {
      const allValid = result.invalid.length === 0;
      return (
        <Badge tone={allValid ? 'success' : 'warning'}>
          {allValid
            ? `Bản nháp hợp lệ (${result.summary.validCount} mục)`
            : `Hợp lệ ${result.summary.validCount}/${result.summary.totalSubmitted} mục`}
        </Badge>
      );
    }
    return <Badge tone="warning">Bản nháp chưa hợp lệ</Badge>;
  }

  function renderErrorOrSummary() {
    if (isSaved && savedSummary) {
      return (
        <p className="settingsPanel__helper" role="status">
          Đã ghi nhận {savedSummary.count} bản nháp để xem lại. Shime chưa tự lưu vào học —
          các thẻ sẽ chỉ vào Thư viện khi luồng nhập của bạn xác nhận lần cuối.
        </p>
      );
    }
    if (!result) {
      return (
        <p className="settingsPanel__helperSecondary">
          Hãy dán JSON xuất từ EduGen rồi bấm <strong>Xem lại trước khi lưu</strong>.
          Không có thẻ nào được lưu cho đến khi bạn xác nhận.
        </p>
      );
    }
    if (!result.ok) {
      return (
        <p className="edugenDraftReview__error" role="alert">
          {describeEdugenDraftError(result.error)}
        </p>
      );
    }
    const { summary } = result;
    return (
      <p className="settingsPanel__helper">
        Đã đọc {summary.totalSubmitted} mục bản nháp.
        Hợp lệ: {summary.validCount}.
        Cần sửa: {summary.invalidCount}.
        Tổng ký tự: {summary.totalCharacters}.
        Kết quả có thể sai hoặc thiếu ý — hãy đọc kỹ trước khi xác nhận.
      </p>
    );
  }

  function renderPreviewItems() {
    if (!result || !result.ok || previewItems.length === 0) return null;
    return (
      <div className="edugenDraftReview__preview" aria-label="Xem trước bản nháp EduGen">
        <h3 className="edugenDraftReview__previewTitle">Xem trước (tối đa 5 mục đầu)</h3>
        <ol className="edugenDraftReview__list">
          {previewItems.map(item => (
            <li key={item.id} className="edugenDraftReview__item">
              <p className="edugenDraftReview__question">
                <strong>Câu hỏi:</strong> {clip(item.question)}
              </p>
              <p className="edugenDraftReview__answer">
                <strong>Đáp án:</strong> {clip(item.answer)}
              </p>
              {item.sourceMetadata.sourceName && (
                <p className="edugenDraftReview__source">
                  Nguồn: {clip(item.sourceMetadata.sourceName, 80)}
                </p>
              )}
            </li>
          ))}
        </ol>
        {result.items.length > previewItems.length && (
          <p className="settingsPanel__helperSecondary">
            …và {result.items.length - previewItems.length} mục khác sẽ vào danh sách xác nhận lưu.
          </p>
        )}
      </div>
    );
  }

  function renderInvalidList() {
    if (!result || result.invalid.length === 0) return null;
    return (
      <div className="edugenDraftReview__invalid" aria-label="Mục cần sửa trước khi lưu">
        <h3 className="edugenDraftReview__previewTitle">Mục cần sửa ({result.invalid.length})</h3>
        <ul className="edugenDraftReview__list">
          {result.invalid.slice(0, 5).map(entry => (
            <li key={`invalid-${entry.index}`} className="edugenDraftReview__itemInvalid">
              Mục #{entry.index + 1}: {describeEdugenDraftInvalidReason(entry.reason)}
            </li>
          ))}
        </ul>
        {result.invalid.length > 5 && (
          <p className="settingsPanel__helperSecondary">
            …và {result.invalid.length - 5} mục không hợp lệ khác.
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className="settingsPanel edugenDraftReview"
      aria-label="Xưởng bản nháp EduGen — xem lại trước khi lưu"
    >
      <Card
        eyebrow="Tuỳ chọn · Xem lại trước khi lưu"
        title="Xưởng bản nháp EduGen"
        variant="default"
      >
        <div className="settingsPanel__section">
          <p className="settingsPanel__helper">
            Dán JSON xuất từ EduGen vào ô bên dưới để xem trước bản nháp.
            Bản nháp cần xem lại trước khi lưu vào Thư viện.
            Shime không tự gọi AI/OCR và không tự lưu thẻ khi bạn chưa xác nhận.
          </p>
          <p className="settingsPanel__helperSecondary">
            EduGen chạy riêng và tùy chọn. Kết quả có thể sai hoặc thiếu ý.
          </p>

          <label className="edugenWorkshopPanel__fieldLabel" htmlFor={sourceId}>
            Tên nguồn (tuỳ chọn)
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
            Dán JSON bản nháp từ EduGen
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
            Hỗ trợ tối đa {MAX_DRAFT_ITEMS} mục, mỗi trường tối đa {MAX_FIELD_LENGTH} ký tự.
            Không có tài liệu nào được tải lên — Shime chỉ đọc văn bản bạn dán.
          </p>

          <div className="edugenWorkshopPanel__actions">
            <Button
              type="button"
              variant="primary"
              onClick={handlePreview}
              disabled={!draftText.trim()}
            >
              Xem lại trước khi lưu
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleConfirm}
              disabled={!isPreviewing || !result || !result.ok}
            >
              Xác nhận lưu bản nháp
            </Button>
            <Button type="button" variant="ghost" onClick={handleLoadSample}>
              Dán mẫu
            </Button>
            <Button type="button" variant="ghost" onClick={handleReset}>
              Xoá nội dung
            </Button>
          </div>

          <div className="edugenWorkshopPanel__status" aria-live="polite">
            {renderStatusBadge()}
            {renderErrorOrSummary()}
          </div>

          {renderPreviewItems()}
          {renderInvalidList()}

          <ul className="edugenWorkshopPanel__guardrails">
            <li>Bản nháp cần xem lại trước khi lưu — Shime không tự lưu vào học.</li>
            <li>Shime không tự gọi AI/OCR và không tự xử lý tài liệu PDF/DOCX trên trình duyệt.</li>
            <li>EduGen chạy riêng và tùy chọn; không có cloud sync, không có tài khoản.</li>
            <li>Shime không tự bật xếp lịch ghi nhớ FSRS khi bạn nhập bản nháp EduGen.</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
