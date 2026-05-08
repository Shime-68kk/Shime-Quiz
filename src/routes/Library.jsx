import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Toast from '../components/Toast.jsx';
import V2BackupRestorePanel from '../components/learning/V2BackupRestorePanel.jsx';
import { buildManualAiQuizPrompt, getManualAiPromptWarnings } from '../data/aiPromptBuilder.js';
import { reviewManualAiOutputText } from '../data/aiOutputReview.js';
import { demoSampleQuiz } from '../data/demoSampleQuiz.js';
import { parseCsvImport } from '../data/csvImportParser.js';
import { parseLearningDataJson } from '../data/importValidator.js';
import { reviewQuizDraftQuality } from '../data/quizDraftQuality.js';
import { isSupportedTextQuizFileName, parseTextQuizDraft } from '../data/textQuizParser.js';
import { extractSingleFile, getFileProcessorBaseUrl, isSupportedEduGenDocumentFileName } from '../services/fileProcessorClient.js';
import { createLibraryBackupFileName, createLibraryExportPayload, downloadJsonFile } from '../data/libraryExport.js';
import { resetLearningDataToMock, setLearningData, useLearningDataAdapter, useLearningDataSource, useLearningDataSummary } from '../data/learningDataStore.js';
import { selectWeightedPracticeItems } from '../learning/weightedPracticeSelector.js';
import { readReviewSchedule } from '../state/reviewScheduleStorage.js';
import { readStudyHistory } from '../state/studyHistoryStorage.js';

const itemTypeLabels = {
  multiple_choice: 'Trắc nghiệm',
  short_answer: 'Trả lời ngắn',
  flashcard: 'Flashcard'
};

function getItemTypeCounts(items) {
  return items.reduce((counts, item) => {
    counts[item.type] = (counts[item.type] || 0) + 1;
    return counts;
  }, {});
}

function buildSubjectCards(adapter) {
  return adapter.getSubjects().map(subject => {
    const topics = adapter.getTopicsBySubject(subject.id);
    const items = adapter.getItemsBySubject(subject.id);

    return {
      subject,
      topics,
      items,
      itemTypeCounts: getItemTypeCounts(items)
    };
  });
}

function IssueList({ title, issues, tone }) {
  if (!issues.length) return null;

  return (
    <div className={`importIssues importIssues--${tone}`}>
      <strong>{title}</strong>
      <ul>
        {issues.slice(0, 8).map((issue, index) => (
          <li key={`${issue.code}-${issue.path}-${index}`}>
            {issue.message}
            {issue.path ? <small>{issue.path}</small> : null}
          </li>
        ))}
      </ul>
      {issues.length > 8 ? <p className="muted">Còn {issues.length - 8} mục khác. Hãy sửa file rồi thử lại.</p> : null}
    </div>
  );
}

const qualityToneByLevel = {
  error: 'danger',
  warning: 'warning',
  info: 'info'
};

function AiOutputReviewPanel({ review }) {
  if (!review) return null;

  const warnings = review.warnings || [];

  return (
    <div className="aiOutputReview" aria-label="Kiểm tra kết quả AI thủ công">
      <div>
        <strong>Kiểm tra kết quả AI thủ công</strong>
        <p className="muted">Shime chỉ kiểm tra định dạng và chất lượng cơ bản. Bạn vẫn cần tự kiểm chứng nội dung.</p>
      </div>
      {warnings.length ? (
        <ul className="aiOutputReview__list">
          {warnings.slice(0, 8).map((warning, index) => (
            <li key={`${warning.code}-${index}`} className={`aiOutputReview__item aiOutputReview__item--${qualityToneByLevel[warning.level] || 'warning'}`}>
              <Badge tone={qualityToneByLevel[warning.level] || 'warning'}>
                {warning.level === 'info' ? 'Gợi ý' : warning.level === 'error' ? 'Cần xem lại' : 'Cảnh báo'}
              </Badge>
              <span>{warning.message}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Không thấy vấn đề định dạng AI phổ biến. Hãy tiếp tục xem trước, kiểm tra chất lượng và xác nhận lưu nếu nội dung phù hợp.</p>
      )}
      <p className="muted">Nếu AI trả JSON hoặc thêm lời bình, hãy yêu cầu AI trả lại đúng định dạng văn bản/Markdown của Shime. Nếu AI trả bảng, hãy chuyển bảng thành câu hỏi rõ ràng.</p>
    </div>
  );
}

function QualityReviewPanel({ review }) {
  if (!review) return null;

  const warnings = review.warnings || [];
  const { summary } = review;
  const seriousWarnings = warnings.filter(warning => warning.level !== 'info');
  const advisoryInfo = warnings.filter(warning => warning.level === 'info');

  return (
    <div className="qualityReview" aria-label="Đánh giá chất lượng bản nháp">
      <div className="qualityReview__header">
        <div>
          <strong>Đánh giá chất lượng bản nháp</strong>
          <p className="muted">
            {warnings.length
              ? 'Bản nháp có một số điểm nên xem lại trước khi lưu.'
              : 'Không có cảnh báo chất lượng nghiêm trọng.'}
          </p>
        </div>
        <div className="qualityReview__badges" aria-label="Tóm tắt cảnh báo chất lượng">
          <Badge tone={summary.errorCount ? 'danger' : warnings.length ? 'warning' : 'success'}>
            {warnings.length ? `${warnings.length} cảnh báo` : 'Ổn để xem lại'}
          </Badge>
          {summary.itemWarningCount ? <Badge tone="neutral">{summary.itemWarningCount} mục cần xem</Badge> : null}
        </div>
      </div>

      {warnings.length ? (
        <ul className="qualityReview__list">
          {[...seriousWarnings, ...advisoryInfo].slice(0, 10).map((warning, index) => (
            <li key={`${warning.code}-${warning.path}-${index}`} className={`qualityReview__item qualityReview__item--${qualityToneByLevel[warning.level] || 'warning'}`}>
              <Badge tone={qualityToneByLevel[warning.level] || 'warning'}>
                {warning.level === 'info' ? 'Gợi ý' : warning.level === 'error' ? 'Cần xem lại' : 'Cảnh báo'}
              </Badge>
              <span>{warning.message}</span>
              {warning.path ? <small>{warning.path}</small> : null}
            </li>
          ))}
        </ul>
      ) : null}

      {warnings.length > 10 ? <p className="muted">Còn {warnings.length - 10} cảnh báo khác. Hãy xem kỹ bản nháp sau khi lưu.</p> : null}
      <p className="muted">Đây chỉ là gợi ý kiểm tra chất lượng. Vẫn có thể lưu sau khi xem lại nếu nội dung phù hợp.</p>
    </div>
  );
}

function ImportPreview({ preview, fileName, onConfirm, onCancel }) {
  if (!preview) return null;

  const { validation } = preview;
  const { summary, errors, warnings, canImport } = validation;
  const itemTypeEntries = Object.entries(summary.itemTypeCounts);
  const formatLabel = preview.format === 'csv'
    ? 'CSV'
    : preview.format === 'text'
      ? 'Văn bản'
      : preview.format === 'document'
        ? 'Tài liệu qua EduGen'
        : 'JSON';

  return (
    <Card title="Xem trước file nạp" eyebrow="Xem trước dữ liệu nạp" variant="elevated" className="importPreview">
      <div className="importPreview__header">
        <div>
          <p className="muted">File đã chọn</p>
          <strong>{fileName}</strong>
        </div>
        <div className="importPreview__badges" aria-label="Thông tin file nạp">
          <Badge tone="info">{formatLabel}</Badge>
          <Badge tone={errors.length ? 'danger' : warnings.length ? 'warning' : 'success'}>
            {errors.length ? 'Có lỗi' : warnings.length ? 'Có cảnh báo' : 'Sẵn sàng import'}
          </Badge>
        </div>
      </div>

      <div className="importSummaryGrid" aria-label="Tóm tắt dữ liệu nạp">
        {preview.format === 'csv' ? <span><strong>{preview.rowsParsed}</strong> dòng CSV</span> : null}
        {preview.format === 'text' ? <span><strong>{preview.linesParsed}</strong> dòng nội dung</span> : null}
        <span><strong>{summary.subjectCount}</strong> môn học</span>
        <span><strong>{summary.topicCount}</strong> chủ đề</span>
        <span><strong>{summary.itemCount}</strong> mục học</span>
        <span><strong>{summary.validItems}</strong> mục hợp lệ</span>
      </div>

      {preview.sourceMetadata ? (
        <div className="importSourceMeta" aria-label="Thông tin nguồn trích xuất">
          <span><strong>File nguồn:</strong> {preview.sourceMetadata.originalName || fileName}</span>
          {preview.sourceMetadata.fileType ? <span><strong>Loại:</strong> {preview.sourceMetadata.fileType}</span> : null}
          {Number.isFinite(preview.sourceMetadata.wordCount) ? <span><strong>Số từ:</strong> {preview.sourceMetadata.wordCount}</span> : null}
          {Number.isFinite(preview.sourceMetadata.lineCount) ? <span><strong>Số dòng:</strong> {preview.sourceMetadata.lineCount}</span> : null}
          {preview.sourceMetadata.extractionMethod ? <span><strong>Cách trích xuất:</strong> {preview.sourceMetadata.extractionMethod}</span> : null}
        </div>
      ) : null}

      <div className="badgeList" aria-label="Phân bổ loại mục hợp lệ">
        {itemTypeEntries.length ? itemTypeEntries.map(([type, count]) => (
          <Badge key={type} tone="info">
            {itemTypeLabels[type] || type}: {count}
          </Badge>
        )) : <Badge tone="neutral">Chưa có mục học hợp lệ</Badge>}
      </div>

      <IssueList title="Lỗi cần sửa" issues={errors} tone="danger" />
      <IssueList title="Cảnh báo" issues={warnings} tone="warning" />
      <QualityReviewPanel review={preview.qualityReview} />

      <div className="sampleItems" aria-label="Mục học mẫu đã phân tích">
        <strong>Mục học mẫu</strong>
        {summary.sampleItems.length ? (
          <div className="sampleItemList">
            {summary.sampleItems.map(item => (
              <article key={item.id} className="sampleItem">
                <Badge tone="neutral">{itemTypeLabels[item.type] || item.type}</Badge>
                <h3>{item.prompt}</h3>
                <p className="muted">ID: {item.id}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">Không có mục học hợp lệ để hiển thị mẫu.</p>
        )}
      </div>

      <div className="importPreview__actions">
        <Button type="button" onClick={onConfirm} disabled={!canImport}>
          Import và lưu cục bộ
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Hủy xem trước
        </Button>
      </div>
    </Card>
  );
}

export default function Library() {
  const navigate = useNavigate();
  const adapter = useLearningDataAdapter();
  const dataSource = useLearningDataSource();
  const summary = useLearningDataSummary();
  const fileInputRef = useRef(null);
  const textFileInputRef = useRef(null);
  const documentFileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isExportingLibrary, setIsExportingLibrary] = useState(false);
  const [textDraft, setTextDraft] = useState('');
  const [isParsingText, setIsParsingText] = useState(false);
  const [isReadingTextFile, setIsReadingTextFile] = useState(false);
  const [isExtractingDocument, setIsExtractingDocument] = useState(false);
  const [aiPromptSource, setAiPromptSource] = useState('');
  const [aiPromptOptions, setAiPromptOptions] = useState({
    multipleChoiceCount: 5,
    flashcardCount: 3,
    shortAnswerCount: 2,
    languageMode: 'keep_source'
  });
  const [aiPromptResult, setAiPromptResult] = useState(null);
  const [aiPromptStatus, setAiPromptStatus] = useState(null);
  const [aiOutputReview, setAiOutputReview] = useState(null);
  const subjectCards = buildSubjectCards(adapter);
  const sourceLabel = dataSource.sourceType === 'mock'
    ? 'Dữ liệu mẫu'
    : dataSource.sourceType === 'csv'
      ? 'Đã nạp CSV'
      : dataSource.sourceType === 'json'
        ? 'Đã nạp JSON'
         : 'Dữ liệu đã nạp';
  const importedTime = dataSource.importedAt
    ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dataSource.importedAt))
    : null;

  function openStudyPlaceholder(subject, topic) {
    navigate('/study-room', {
      state: {
        selection: {
          subjectId: subject.id,
          subjectTitle: subject.title,
          topicId: topic?.id,
          topicTitle: topic?.title
        }
      }
    });
  }

  function openSmartPractice(subject, topic) {
    const history = readStudyHistory();
    const schedule = readReviewSchedule();
    const selection = selectWeightedPracticeItems({
      items: adapter.getAllItems(),
      historyRecords: history.records || [],
      scheduleRecords: schedule.records || [],
      requestedCount: 10,
      filter: { subjectId: subject?.id, topicId: topic?.id }
    });

    if (!selection.selectedCount) {
      setImportStatus({
        tone: 'warning',
        title: 'Chưa có câu phù hợp',
        description: 'Không tạo được phiên luyện tập thông minh từ lựa chọn hiện tại.'
      });
      return;
    }

    navigate('/study-room', {
      state: {
        selection: {
          mode: 'smart-practice',
          source: 'weighted-practice',
          label: 'Luyện tập thông minh',
          subjectId: subject?.id,
          subjectTitle: subject?.title,
          topicId: topic?.id,
          topicTitle: topic?.title,
          requestedCount: selection.requestedCount,
          selectedItemIds: selection.selectedItemIds
        }
      }
    });
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function openTextFilePicker() {
    textFileInputRef.current?.click();
  }

  function openDocumentFilePicker() {
    documentFileInputRef.current?.click();
  }

  function resetPreview() {
    setPreview(null);
    setImportStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (textFileInputRef.current) textFileInputRef.current.value = '';
    if (documentFileInputRef.current) documentFileInputRef.current.value = '';
  }

  function resetTextDraftPreview() {
    setTextDraft('');
    setAiOutputReview(null);
    resetPreview();
  }

  function reviewManualAiPasteBack() {
    const review = reviewManualAiOutputText(textDraft);
    setAiOutputReview(review);
    setImportStatus({
      tone: review.summary.errorCount ? 'warning' : review.summary.warningCount ? 'warning' : 'success',
      title: 'Đã kiểm tra kết quả AI thủ công',
      description: review.summary.warningCount
        ? 'Hãy xem các gợi ý định dạng trước khi tạo bản nháp import.'
        : 'Chưa thấy vấn đề định dạng AI phổ biến. Bạn vẫn cần tự kiểm chứng nội dung trước khi lưu.'
    });
  }

  function createTextDraftPreview(sourceText, sourceName, options = {}) {
    const {
      format = 'text',
      successTitle = 'Đã tạo bản nháp câu hỏi',
      successDescription = 'Hãy xem lại bản nháp câu hỏi trước khi lưu vào thư viện cục bộ.',
      sourceMetadata = null
    } = typeof options === 'string' ? { successDescription: options } : options;
    const result = parseTextQuizDraft(sourceText);
    const qualityReview = reviewQuizDraftQuality(result.rawData);
    setPreview({
      fileName: sourceName,
      format,
      linesParsed: result.linesParsed ?? 0,
      rawData: result.rawData,
      validation: result.validation,
      qualityReview,
      sourceMetadata
    });
    setImportStatus({
      tone: result.validation.errors.length ? 'danger' : result.validation.warnings.length ? 'warning' : 'success',
      title: result.validation.errors.length ? 'Không tạo được bản nháp import' : successTitle,
      description: result.validation.errors.length
        ? 'Nội dung chưa đủ rõ để import. Hãy xem lỗi/cảnh báo và chỉnh lại mẫu nhập.'
        : successDescription
    });
    return result;
  }

  function parseTextDraft() {
    setIsParsingText(true);
    setImportStatus(null);

    try {
      setAiOutputReview(reviewManualAiOutputText(textDraft));
      createTextDraftPreview(textDraft, 'Nội dung đã dán');
    } catch (error) {
      setPreview(null);
      setImportStatus({
        tone: 'danger',
        title: 'Không phân tích được nội dung',
        description: error.message || 'Nội dung đã dán không thể chuyển thành bản nháp câu hỏi.'
      });
    } finally {
      setIsParsingText(false);
    }
  }

  async function handleTextQuizFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsReadingTextFile(true);
    setImportStatus(null);

    try {
      if (!isSupportedTextQuizFileName(file.name)) {
        setPreview(null);
        setImportStatus({
          tone: 'danger',
          title: 'Định dạng file chưa hỗ trợ',
          description: 'Chỉ hỗ trợ file .txt hoặc .md trong bước này.'
        });
        return;
      }

      const text = await file.text();
      if (!text.trim()) {
        setPreview(null);
        setImportStatus({
          tone: 'warning',
          title: 'File trống',
          description: 'File không có nội dung văn bản.'
        });
        return;
      }

      createTextDraftPreview(text, file.name, {
        successDescription: 'Đã đọc file. Hãy xem lại bản nháp trước khi lưu.'
      });
    } catch (error) {
      setPreview(null);
      setImportStatus({
        tone: 'danger',
        title: 'Không đọc được file văn bản',
        description: error.message || 'Không đọc được file văn bản.'
      });
    } finally {
      setIsReadingTextFile(false);
      if (textFileInputRef.current) textFileInputRef.current.value = '';
    }
  }


  async function handleDocumentDraftFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsExtractingDocument(true);
    setImportStatus(null);

    try {
      if (!isSupportedEduGenDocumentFileName(file.name)) {
        setPreview(null);
        setImportStatus({
          tone: 'danger',
          title: 'Định dạng file chưa hỗ trợ',
          description: 'Chỉ hỗ trợ file PDF, DOCX, PPTX hoặc ZIP trong bước này.'
        });
        return;
      }

      const extractionResult = await extractSingleFile(file);
      if (!extractionResult.ok) {
        const isConnectionError = extractionResult.code === 'edugen_network_error';
        setPreview(null);
        setImportStatus({
          tone: 'danger',
          title: isConnectionError ? 'Không kết nối được EduGen' : 'Không trích xuất được tài liệu',
          description: extractionResult.message || 'Không trích xuất được nội dung tài liệu.'
        });
        return;
      }

      const sourceMetadata = {
        originalName: extractionResult.file.originalName || file.name,
        fileType: extractionResult.file.fileType || file.name.split('.').pop()?.toLowerCase() || '',
        wordCount: extractionResult.extraction.wordCount,
        lineCount: extractionResult.extraction.lineCount,
        charCount: extractionResult.extraction.charCount,
        extractionMethod: extractionResult.parserMetadata.extractionMethod
      };

      createTextDraftPreview(extractionResult.cleanedText, file.name, {
        format: 'document',
        successTitle: 'Đã trích xuất tài liệu',
        successDescription: 'Đã trích xuất tài liệu. Hãy xem lại bản nháp trước khi lưu.',
        sourceMetadata
      });
    } catch (error) {
      setPreview(null);
      setImportStatus({
        tone: 'danger',
        title: 'Không trích xuất được tài liệu',
        description: error.message || 'Không trích xuất được nội dung tài liệu.'
      });
    } finally {
      setIsExtractingDocument(false);
      if (documentFileInputRef.current) documentFileInputRef.current.value = '';
    }
  }


  function updateAiPromptOption(key, value) {
    setAiPromptOptions(current => ({ ...current, [key]: value }));
  }

  function generateManualAiPrompt() {
    const result = buildManualAiQuizPrompt({
      ...aiPromptOptions,
      sourceText: aiPromptSource
    });
    setAiPromptResult(result);
    setAiPromptStatus({
      tone: result.ok ? (result.warnings.length ? 'warning' : 'success') : 'warning',
      title: result.ok ? 'Đã tạo prompt thủ công' : 'Chưa thể tạo prompt',
      description: result.ok
        ? 'Hãy sao chép prompt và tự dán vào công cụ AI bên ngoài nếu bạn đồng ý chia sẻ nội dung đó.'
        : (result.warnings[0]?.message || 'Hãy kiểm tra nội dung nguồn và số lượng câu hỏi mong muốn.')
    });
  }

  async function copyManualAiPrompt() {
    if (!aiPromptResult?.ok || !aiPromptResult.prompt) return;

    try {
      await navigator.clipboard.writeText(aiPromptResult.prompt);
      setAiPromptStatus({
        tone: 'success',
        title: 'Đã sao chép prompt',
        description: 'Hãy tự dán prompt vào công cụ AI bên ngoài, rồi dán kết quả AI vào ô văn bản/Markdown của Shime để xem trước.'
      });
    } catch (error) {
      setAiPromptStatus({
        tone: 'warning',
        title: 'Không tự động sao chép được',
        description: 'Trình duyệt không cho phép sao chép tự động. Hãy bôi đen prompt và sao chép thủ công.'
      });
    }
  }

  function detectImportFormat(file) {
    const name = file?.name?.toLowerCase() || '';
    if (name.endsWith('.csv') || file?.type === 'text/csv') return 'csv';
    return 'json';
  }

  function loadDemoSampleQuickstart() {
    setImportStatus(null);
    setAiOutputReview(null);

    try {
      const result = parseLearningDataJson(JSON.stringify(demoSampleQuiz));
      const qualityReview = result.rawData ? reviewQuizDraftQuality(result.rawData) : null;
      setPreview({
        fileName: 'Bộ quiz mẫu cục bộ',
        format: 'json',
        rawData: result.rawData,
        validation: result.validation,
        qualityReview
      });
      setImportStatus({
        tone: result.validation.errors.length ? 'danger' : result.validation.warnings.length ? 'warning' : 'success',
        title: result.validation.errors.length ? 'Không thể tải bộ mẫu' : 'Đã tải bộ quiz mẫu',
        description: result.validation.errors.length
          ? 'Bộ mẫu chưa qua được kiểm tra import. Hãy xem lỗi trong bản xem trước.'
          : 'Đây là bộ mẫu cục bộ, không do Shime tạo bằng AI và không gọi AI/API. Hãy xem trước, đọc đánh giá chất lượng rồi tự xác nhận lưu nếu muốn.'
      });
    } catch (error) {
      setPreview(null);
      setImportStatus({
        tone: 'danger',
        title: 'Không tải được bộ mẫu',
        description: error.message || 'Không thể tạo bản xem trước từ bộ mẫu cục bộ.'
      });
    }
  }

  async function handleImportFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsReadingFile(true);
    setImportStatus(null);

    try {
      const text = await file.text();
      const format = detectImportFormat(file);
      const result = format === 'csv' ? parseCsvImport(text) : parseLearningDataJson(text);
      const qualityReview = result.rawData ? reviewQuizDraftQuality(result.rawData) : null;
      setPreview({
        fileName: file.name,
        format,
        rowsParsed: result.rowsParsed ?? null,
        rawData: result.rawData,
        validation: result.validation,
        qualityReview
      });
      setImportStatus({
        tone: result.validation.errors.length ? 'danger' : result.validation.warnings.length ? 'warning' : 'success',
        title: result.validation.errors.length ? 'Không thể import file này' : `Đã đọc file ${format.toUpperCase()}`,
        description: result.validation.errors.length
          ? 'File có lỗi cấu trúc. Hãy xem trước để sửa trước khi nạp.'
          : 'Hãy kiểm tra tóm tắt trước khi import vào phiên hiện tại.'
      });
    } catch (error) {
      setPreview(null);
      setImportStatus({
        tone: 'danger',
        title: 'Không đọc được file',
        description: error.message || 'File không thể đọc trong trình duyệt.'
      });
    } finally {
      setIsReadingFile(false);
    }
  }

  function confirmImport() {
    if (!preview?.validation?.canImport) return;
    const result = setLearningData(preview.validation.normalizedData, {
      sourceName: preview.fileName,
      sourceType: preview.format || 'manual'
    });

    setImportStatus({
      tone: result.ok ? (preview.validation.warnings.length ? 'warning' : 'success') : 'warning',
      title: result.ok ? 'Đã import và lưu cục bộ' : 'Đã import nhưng chưa lưu được',
      description: result.ok
        ? preview.validation.warnings.length
          ? 'Nạp thành công và đã lưu cục bộ, nhưng có cảnh báo. Hãy xem lại các mục đã tạo từ nội dung nguồn.'
          : preview.format === 'text'
            ? 'Thư viện đã lưu bản nháp câu hỏi từ văn bản/Markdown cho lần mở sau.'
            : `Thư viện đã lưu dữ liệu ${preview.format?.toUpperCase() || 'nạp'} vừa chọn cho lần mở sau.`
        : 'Dữ liệu đã cập nhật cho phiên hiện tại, nhưng localStorage không lưu được. Hãy kiểm tra dung lượng/quyền lưu trữ của trình duyệt.'
    });
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (textFileInputRef.current) textFileInputRef.current.value = '';
    if (documentFileInputRef.current) documentFileInputRef.current.value = '';
  }


  function exportCurrentLibrary() {
    setIsExportingLibrary(true);

    try {
      const result = createLibraryExportPayload(adapter.data, dataSource, summary);

      if (!result.ok) {
        setImportStatus({
          tone: 'danger',
          title: 'Không thể xuất thư viện',
          description: 'Dữ liệu thư viện hiện tại chưa hợp lệ nên export đã bị chặn. Hãy reset hoặc import lại file hợp lệ.'
        });
        return;
      }

      const filename = createLibraryBackupFileName();
      const downloadResult = downloadJsonFile(result.payload, filename);

      setImportStatus({
        tone: downloadResult.ok ? 'success' : 'danger',
        title: downloadResult.ok ? 'Đã xuất thư viện' : 'Không thể tải file export',
        description: downloadResult.ok
          ? `Đã tạo file ${filename}. File này có thể import lại qua luồng JSON hiện tại.`
          : downloadResult.message || 'Trình duyệt không cho phép tạo file tải xuống lúc này.'
      });
    } finally {
      setIsExportingLibrary(false);
    }
  }

  function resetImportedLibrary() {
    const confirmed = window.confirm('Xóa dữ liệu import v2 đã lưu và quay về dữ liệu mẫu? Thao tác này không ảnh hưởng dữ liệu app khác.');
    if (!confirmed) return;

    resetLearningDataToMock();
    resetPreview();
    setImportStatus({
      tone: 'success',
      title: 'Đã reset thư viện v2',
      description: 'Dữ liệu đã nạp đã lưu trong localStorage đã được xóa. App đang dùng lại mock data.'
    });
  }

  return (
    <div className="pageStack">
      <PageHeader
        eyebrow="Thư viện"
        title="Thư viện học liệu"
        subtitle="Dữ liệu nhiều môn học được chuẩn hóa qua bộ chuyển đổi v2. Dữ liệu JSON/CSV sau khi nạp sẽ được lưu cục bộ trong trình duyệt."
        actions={(
          <>
            <Button type="button" variant="secondary" loading={isReadingFile} onClick={openFilePicker}>
              Nạp JSON/CSV
            </Button>
            <Button type="button" variant="secondary" onClick={() => openSmartPractice()} disabled={summary.itemCount === 0}>
              Luyện tập thông minh
            </Button>
            <Button type="button" variant="ghost" loading={isExportingLibrary} onClick={exportCurrentLibrary}>
              Xuất thư viện
            </Button>
            {dataSource.sourceType !== 'mock' ? (
              <Button type="button" variant="ghost" onClick={resetImportedLibrary}>
                Xóa dữ liệu import
              </Button>
            ) : null}
          </>
        )}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,text/csv,.json,.csv"
        className="srOnly"
        onChange={handleImportFile}
        aria-label="Chọn file JSON hoặc CSV học liệu"
      />

      <input
        ref={textFileInputRef}
        type="file"
        accept=".txt,.md,text/plain,text/markdown,text/x-markdown"
        className="srOnly"
        onChange={handleTextQuizFile}
        aria-label="Chọn file .txt hoặc .md để tạo bản nháp câu hỏi"
      />

      <input
        ref={documentFileInputRef}
        type="file"
        accept=".pdf,.docx,.pptx,.zip,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip"
        className="srOnly"
        onChange={handleDocumentDraftFile}
        aria-label="Chọn file PDF, DOCX, PPTX hoặc ZIP để tạo bản nháp câu hỏi qua EduGen"
      />

      {subjectCards.length === 0 ? (
        <Card title="Thư viện của bạn đang trống" eyebrow="Bắt đầu nhanh" className="libraryEmptyOnboardingCard">
          <div className="textImportCard__intro">
            <p className="muted">
              Bắt đầu nhanh bằng quiz mẫu, import JSON/CSV, hoặc dán nội dung text/Markdown. Phần này chỉ hướng dẫn bạn đến các luồng hiện có và không tự nạp hay tự lưu dữ liệu.
            </p>
            <p className="muted">
              Quiz mẫu chỉ mở phần xem trước/kiểm tra chất lượng. Bạn vẫn cần xác nhận trước khi lưu vào thư viện cục bộ.
            </p>
            <p className="muted">
              AI trong Shime hiện là quy trình thủ công: tạo prompt, copy sang công cụ bên ngoài, rồi dán kết quả lại để kiểm tra. Shime không gọi AI/API và không có API key/BYOK.
            </p>
            <p className="muted">
              Import tài liệu PDF/DOCX/PPTX/ZIP cần EduGen chạy riêng và được cấu hình; EduGen không được bundle vào Shime và chỉ trích xuất chữ khi service hỗ trợ.
            </p>
          </div>
          <div className="textImportHelp" aria-label="Cách bắt đầu khi thư viện trống">
            <Badge tone="info">Dùng quiz mẫu</Badge>
            <Badge tone="info">Nạp JSON/CSV</Badge>
            <Badge tone="info">Dán text/Markdown</Badge>
            <Badge tone="neutral">AI thủ công copy/paste</Badge>
            <Badge tone="neutral">EduGen riêng khi cần tài liệu</Badge>
          </div>
        </Card>
      ) : null}

      <Card title="Thử nhanh với quiz mẫu" eyebrow="Demo cục bộ" className="demoSampleQuickstartCard">
        <div className="textImportCard__intro">
          <div className="manualAiPromptWarning" role="note">
            <strong>Mới dùng Shime?</strong>
            <span>Bấm “Dùng quiz mẫu” để thử nhanh quy trình tạo quiz. Quiz mẫu chỉ mở phần xem trước/kiểm tra chất lượng; bạn vẫn cần xác nhận trước khi lưu. Không dùng AI/API và không cần EduGen.</span>
          </div>
          <p className="muted">
            Tải một bộ quiz mẫu an toàn, trung lập và có sẵn trong ứng dụng để thử nhanh luồng import. Bộ mẫu này là dữ liệu cục bộ, không do Shime tạo bằng AI, không gọi AI/API và không dùng EduGen.
          </p>
          <p className="muted">
            Shime chỉ tạo bản xem trước từ bộ mẫu; bạn vẫn cần xem lại, đọc đánh giá chất lượng và bấm xác nhận lưu nếu muốn thêm vào thư viện cục bộ.
          </p>
        </div>
        <div className="textImportActions">
          <Button type="button" variant="secondary" onClick={loadDemoSampleQuickstart}>
            Dùng quiz mẫu
          </Button>
          <span className="muted">Không tự lưu, không reset dữ liệu hiện có.</span>
        </div>
      </Card>

      <Card title="Chọn cách nhập phù hợp" eyebrow="Hướng dẫn nhanh" className="importMethodGuideCard">
        <div className="importMethodGuide" aria-label="Gợi ý chọn cách nhập học liệu">
          <div>
            <strong>Dán văn bản/Markdown</strong>
            <p className="muted">Dùng khi bạn đã có nội dung dạng câu hỏi, flashcard hoặc ghi chú có cấu trúc.</p>
          </div>
          <div>
            <strong>Tải .txt/.md</strong>
            <p className="muted">Dùng khi nội dung đã nằm trong file văn bản cục bộ.</p>
          </div>
          <div>
            <strong>Tải PDF/DOCX/PPTX/ZIP</strong>
            <p className="muted">Dùng khi bạn đang chạy EduGen File Processor. EduGen chỉ trích xuất chữ; Shime vẫn tạo bản nháp, kiểm tra và yêu cầu xem trước trước khi lưu.</p>
          </div>
        </div>
        <p className="muted">Nếu dùng bản deploy online, trình duyệt cần truy cập được EduGen service đã cấu hình qua <code>VITE_FILE_PROCESSOR_URL</code>. Một số định dạng tài liệu cũ hoặc tài liệu quét có thể không dùng được trong bước này.</p>
      </Card>


      <Card title="Tạo prompt AI thủ công" eyebrow="Không gửi dữ liệu tự động" className="manualAiPromptCard">
        <div className="manualAiPromptCard__intro">
          <p className="muted">
            Shime chỉ tạo prompt trong trình duyệt. Shime không tự gửi dữ liệu cho AI, không dùng API key và không tự import kết quả AI. Bạn tự sao chép prompt sang công cụ AI bên ngoài rồi dán kết quả vào ô văn bản/Markdown để xem trước.
          </p>
          <div className="manualAiPromptWarning" role="note">
            <strong>Lưu ý quyền riêng tư:</strong>
            <span>Nội dung bạn sao chép sang công cụ AI bên ngoài có thể rời khỏi thiết bị. Hãy kiểm tra chính sách bảo mật của công cụ AI bạn dùng. AI có thể tạo sai nội dung, cần xem lại trước khi lưu.</span>
          </div>
        </div>

        <label className="textImportField" htmlFor="manual-ai-source-input">
          <span>Nội dung nguồn để tạo prompt</span>
          <textarea
            id="manual-ai-source-input"
            value={aiPromptSource}
            onChange={event => {
              setAiPromptSource(event.target.value);
              setAiPromptResult(null);
              setAiPromptStatus(null);
            }}
            placeholder="Dán nội dung bài học hoặc phần chữ đã trích xuất. Shime sẽ tạo prompt để bạn tự dùng với công cụ AI bên ngoài."
            rows={7}
          />
        </label>

        <div className="manualAiPromptOptions" aria-label="Tùy chọn prompt AI thủ công">
          <label>
            <span>Trắc nghiệm</span>
            <input
              type="number"
              min="0"
              max="20"
              value={aiPromptOptions.multipleChoiceCount}
              onChange={event => updateAiPromptOption('multipleChoiceCount', event.target.value)}
            />
          </label>
          <label>
            <span>Flashcard</span>
            <input
              type="number"
              min="0"
              max="20"
              value={aiPromptOptions.flashcardCount}
              onChange={event => updateAiPromptOption('flashcardCount', event.target.value)}
            />
          </label>
          <label>
            <span>Câu hỏi ngắn</span>
            <input
              type="number"
              min="0"
              max="20"
              value={aiPromptOptions.shortAnswerCount}
              onChange={event => updateAiPromptOption('shortAnswerCount', event.target.value)}
            />
          </label>
          <label>
            <span>Ngôn ngữ</span>
            <select
              value={aiPromptOptions.languageMode}
              onChange={event => updateAiPromptOption('languageMode', event.target.value)}
            >
              <option value="keep_source">Giữ ngôn ngữ nguồn</option>
              <option value="vi">Tiếng Việt</option>
            </select>
          </label>
        </div>

        <div className="textImportActions">
          <Button type="button" variant="secondary" onClick={generateManualAiPrompt} disabled={!aiPromptSource.trim()}>
            Tạo prompt
          </Button>
          <Button type="button" onClick={copyManualAiPrompt} disabled={!aiPromptResult?.ok}>
            Sao chép prompt
          </Button>
        </div>

        {aiPromptStatus ? <Toast tone={aiPromptStatus.tone} title={aiPromptStatus.title} description={aiPromptStatus.description} /> : null}

        {aiPromptResult?.warnings?.length ? (
          <div className="importIssues importIssues--warning">
            <strong>Gợi ý trước khi dùng prompt</strong>
            <ul>
              {aiPromptResult.warnings.map(warning => <li key={warning.code}>{warning.message}</li>)}
            </ul>
          </div>
        ) : null}

        {aiPromptResult?.prompt ? (
          <label className="manualAiPromptPreview" htmlFor="manual-ai-prompt-preview">
            <span>Prompt đã tạo</span>
            <textarea id="manual-ai-prompt-preview" value={aiPromptResult.prompt} readOnly rows={12} />
            <small>Dán kết quả AI vào ô nhập văn bản/Markdown bên dưới để chạy kiểm tra, xem trước và đánh giá chất lượng trước khi lưu.</small>
          </label>
        ) : null}
      </Card>

      <Card title="Tạo quiz từ văn bản/Markdown" eyebrow="Bản nháp thân thiện" className="textImportCard">
        <div className="textImportCard__intro">
          <p className="muted">
            Dán nội dung bài học hoặc ghi chú của bạn. Bạn có thể dùng tiêu đề <code>#</code> / <code>##</code> hoặc ghi rõ <code>Môn</code>, <code>Chủ đề</code>. Ứng dụng sẽ tạo bản nháp câu hỏi để bạn xem lại trước khi lưu.
          </p>
        </div>
        <label className="textImportField" htmlFor="text-quiz-draft-input">
          <span>Nội dung bài học</span>
          <textarea
            id="text-quiz-draft-input"
            value={textDraft}
            onChange={event => {
              setTextDraft(event.target.value);
              setAiOutputReview(null);
            }}
            placeholder={`Môn: Mạng máy tính
Chủ đề: OSI

Câu hỏi: Application layer thuộc mô hình nào?
A. OSI
B. TCP/IP
Đáp án: A`}
            rows={10}
          />
        </label>
        <div className="textImportHelp" aria-label="Gợi ý định dạng văn bản">
          <Badge tone="info">Trắc nghiệm A, B, C, D</Badge>
          <Badge tone="info">Flashcard Mặt trước/Mặt sau</Badge>
          <Badge tone="info">Câu hỏi ngắn + Đáp án</Badge>
          <Badge tone="neutral">Markdown # / ##</Badge>
        </div>
        <div className="textImportActions">
          <Button type="button" loading={isParsingText} onClick={parseTextDraft} disabled={!textDraft.trim()}>
            Tạo bản nháp câu hỏi
          </Button>
          <Button type="button" variant="secondary" onClick={reviewManualAiPasteBack} disabled={!textDraft.trim()}>
            Kiểm tra kết quả AI thủ công
          </Button>
          {textDraft.trim() ? (
            <Button type="button" variant="ghost" onClick={resetTextDraftPreview}>
              Xóa nội dung dán
            </Button>
          ) : null}
        </div>
        <div className="manualAiPasteBackHint" role="note">
          <strong>Dán kết quả AI thủ công?</strong>
          <span>Shime không tự gọi AI. Nếu bạn dán kết quả từ công cụ AI bên ngoài, hãy kiểm tra định dạng, tạo bản nháp, xem cảnh báo chất lượng rồi mới lưu.</span>
        </div>
        <AiOutputReviewPanel review={aiOutputReview} />
      </Card>

      <Card title="Tạo quiz từ file văn bản/Markdown" eyebrow="File cục bộ" className="textFileImportCard">
        <div className="textImportCard__intro">
          <p className="muted">
            Chọn file <code>.txt</code> hoặc <code>.md</code> để đọc nội dung ngay trong trình duyệt và tạo bản nháp câu hỏi. File không được tải lên máy chủ và bản nháp luôn cần xem trước trước khi lưu.
          </p>
        </div>
        <div className="textFileImportActions">
          <Button type="button" variant="secondary" loading={isReadingTextFile} onClick={openTextFilePicker}>
            Chọn file .txt hoặc .md
          </Button>
          <span className="muted">Hỗ trợ ghi chú văn bản, Markdown # / ##, trắc nghiệm, flashcard và câu hỏi ngắn.</span>
        </div>
      </Card>

      <Card title="Tạo quiz từ tài liệu" eyebrow="EduGen" className="documentImportCard">
        <div className="textImportCard__intro">
          <p className="muted">
            Chọn file PDF, DOCX, PPTX hoặc ZIP để trích xuất chữ bằng EduGen rồi tạo bản nháp câu hỏi. Cần chạy EduGen File Processor trước khi dùng tính năng này; bản deploy online cũng cần URL EduGen có thể truy cập từ trình duyệt. Mặc định dùng <code>VITE_FILE_PROCESSOR_URL</code> hoặc <code>{getFileProcessorBaseUrl()}</code>.
          </p>
        </div>
        <div className="textFileImportActions">
          <Button type="button" variant="secondary" loading={isExtractingDocument} onClick={openDocumentFilePicker}>
            Chọn file tài liệu
          </Button>
          <span className="muted">EduGen chỉ trích xuất chữ; Shime luôn yêu cầu xem trước bản nháp trước khi lưu.</span>
        </div>
      </Card>

      <Card title="Nguồn dữ liệu thư viện" eyebrow="Lưu cục bộ" className="dataSourceCard">
        <div className="dataSourceCard__content">
          <Badge tone={dataSource.sourceType === 'mock' ? 'neutral' : 'success'}>{sourceLabel}</Badge>
          <div>
            <strong>{dataSource.sourceName}</strong>
            <p className="muted">
              {importedTime ? `Import lần cuối: ${importedTime}` : 'Đang dùng dữ liệu mẫu cục bộ. Import thành công sẽ được lưu trong trình duyệt.'}
            </p>
          </div>
        </div>
        <div className="sourceSummaryGrid" aria-label="Tóm tắt dữ liệu có thể xuất">
          <span><strong>{summary.subjectCount}</strong> môn học</span>
          <span><strong>{summary.topicCount}</strong> chủ đề</span>
          <span><strong>{summary.itemCount}</strong> mục học</span>
        </div>
      </Card>

      {dataSource.notice ? (
        <Toast tone="warning" title="Thông báo dữ liệu thư viện" description={dataSource.notice} />
      ) : null}


      <V2BackupRestorePanel
        libraryData={adapter.data}
        librarySource={dataSource}
        librarySummary={summary}
      />

      <Card title="Schema import mong đợi" eyebrow="Mô hình dữ liệu v2">
        <p className="muted">
          Người dùng có thể dán văn bản/Markdown để tạo bản nháp câu hỏi mà không cần biết schema. File JSON nâng cao vẫn nên chứa <code>subjects</code>, <code>topics</code> và <code>items</code>. File export từ nút <code>Xuất thư viện</code> cũng dùng cấu trúc này và có thêm metadata. CSV nên có cột <code>subject</code>, <code>topic</code>, <code>type</code>, <code>prompt</code>, <code>choices</code>, <code>correctAnswer</code>/<code>answer</code>. Mục học hỗ trợ <code>multiple_choice</code>, <code>short_answer</code> và <code>flashcard</code>.
        </p>
      </Card>

      {importStatus ? <Toast tone={importStatus.tone} title={importStatus.title} description={importStatus.description} /> : null}

      <ImportPreview
        preview={preview}
        fileName={preview?.fileName}
        onConfirm={confirmImport}
        onCancel={resetPreview}
      />

      {subjectCards.length === 0 ? (
        <EmptyState
          icon="＋"
          title="Chưa có dữ liệu học liệu"
          description="Thư viện đang trống. Hãy dùng quiz mẫu, nạp JSON/CSV, dán text/Markdown, hoặc dùng quy trình AI thủ công copy/paste để tạo bản nháp. Mọi đường dẫn vẫn cần xem trước, kiểm tra chất lượng và xác nhận lưu."
          action={<Button type="button" variant="secondary" size="sm" onClick={openFilePicker}>Nạp JSON/CSV</Button>}
        />
      ) : null}

      <div className="librarySubjectGrid" aria-label="Danh sách môn học">
        {subjectCards.map(({ subject, topics, items, itemTypeCounts }) => (
          <Card key={subject.id} title={subject.title} eyebrow="Môn học" variant="elevated" interactive>
            <div className="libraryCardBody">
              <p className="muted">{subject.description}</p>
              <div className="libraryStats" aria-label={`Thống kê ${subject.title}`}>
                <span><strong>{topics.length}</strong> chủ đề</span>
                <span><strong>{items.length}</strong> mục học</span>
              </div>
              <div className="badgeList" aria-label="Loại học liệu">
                {Object.entries(itemTypeCounts).map(([type, count]) => (
                  <Badge key={type} tone="info">
                    {itemTypeLabels[type] || type}: {count}
                  </Badge>
                ))}
              </div>
              <div className="topicList" aria-label={`Chủ đề trong ${subject.title}`}>
                {topics.map(topic => {
                  const topicItemCount = adapter.getItemsByTopic(topic.id).length;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      className="topicPill"
                      onClick={() => openStudyPlaceholder(subject, topic)}
                    >
                      <span>{topic.title}</span>
                      <small>{topicItemCount} mục</small>
                    </button>
                  );
                })}
              </div>
              <div className="libraryCardActions">
                <Button type="button" variant="ghost" size="sm" onClick={() => openStudyPlaceholder(subject)}>
                  Xem trong Phòng học
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => openSmartPractice(subject)} disabled={!items.length}>
                  Luyện tập thông minh
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
