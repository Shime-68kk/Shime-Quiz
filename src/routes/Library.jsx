import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Toast from '../components/Toast.jsx';
import V2BackupRestorePanel from '../components/learning/V2BackupRestorePanel.jsx';
import { parseCsvImport } from '../data/csvImportParser.js';
import { parseLearningDataJson } from '../data/importValidator.js';
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
    resetPreview();
  }

  function createTextDraftPreview(sourceText, sourceName, options = {}) {
    const {
      format = 'text',
      successTitle = 'Đã tạo bản nháp câu hỏi',
      successDescription = 'Hãy xem lại bản nháp câu hỏi trước khi lưu vào thư viện cục bộ.',
      sourceMetadata = null
    } = typeof options === 'string' ? { successDescription: options } : options;
    const result = parseTextQuizDraft(sourceText);
    setPreview({
      fileName: sourceName,
      format,
      linesParsed: result.linesParsed ?? 0,
      rawData: result.rawData,
      validation: result.validation,
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

  function detectImportFormat(file) {
    const name = file?.name?.toLowerCase() || '';
    if (name.endsWith('.csv') || file?.type === 'text/csv') return 'csv';
    return 'json';
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
      setPreview({
        fileName: file.name,
        format,
        rowsParsed: result.rowsParsed ?? null,
        rawData: result.rawData,
        validation: result.validation
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
            onChange={event => setTextDraft(event.target.value)}
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
          {textDraft.trim() ? (
            <Button type="button" variant="ghost" onClick={resetTextDraftPreview}>
              Xóa nội dung dán
            </Button>
          ) : null}
        </div>
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
            Chọn file PDF, DOCX, PPTX hoặc ZIP để trích xuất chữ bằng EduGen rồi tạo bản nháp câu hỏi. Cần chạy EduGen File Processor trước khi dùng tính năng này. Mặc định dùng <code>VITE_FILE_PROCESSOR_URL</code> hoặc <code>{getFileProcessorBaseUrl()}</code>.
          </p>
        </div>
        <div className="textFileImportActions">
          <Button type="button" variant="secondary" loading={isExtractingDocument} onClick={openDocumentFilePicker}>
            Chọn file tài liệu
          </Button>
          <span className="muted">EduGen chỉ trích xuất chữ từ PDF, DOCX, PPTX hoặc ZIP; bản nháp vẫn đi qua kiểm tra và xem trước trước khi lưu.</span>
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
          description="Bộ chuyển đổi đang trả về dữ liệu rỗng an toàn. Hãy nạp JSON hoặc CSV đúng cấu trúc v2 để xem trước trước khi dùng."
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
