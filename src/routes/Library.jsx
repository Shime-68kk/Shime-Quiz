import { useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Toast from '../components/Toast.jsx';
import BackupBeforeImportNotice from '../components/learning/BackupBeforeImportNotice.jsx';
import V2BackupRestorePanel from '../components/learning/V2BackupRestorePanel.jsx';
import { buildManualAiQuizPrompt, getManualAiPromptWarnings } from '../data/aiPromptBuilder.js';
import { reviewManualAiOutputText } from '../data/aiOutputReview.js';
import { demoSampleQuiz } from '../data/demoSampleQuiz.js';
import { parseCsvImport } from '../data/csvImportParser.js';
import { parseLearningDataJson } from '../data/importValidator.js';
import { reviewQuizDraftQuality } from '../data/quizDraftQuality.js';
import { isSupportedTextQuizFileName, parseTextQuizDraft } from '../data/textQuizParser.js';
import { extractSingleFile, isSupportedEduGenDocumentFileName } from '../services/fileProcessorClient.js';
import { createLibraryBackupFileName, createLibraryExportPayload, downloadJsonFile } from '../data/libraryExport.js';
import { resetLearningDataToMock, setLearningData, useLearningDataAdapter, useLearningDataSource, useLearningDataSummary } from '../data/learningDataStore.js';
import { isSafeEdugenSourceMetadata } from '../edugen/edugenDraftImport.js';
import { selectWeightedPracticeItems } from '../learning/weightedPracticeSelector.js';
import { readReviewSchedule } from '../state/reviewScheduleStorage.js';
import { readStudyHistory } from '../state/studyHistoryStorage.js';
import LibraryMethodIcon from '../components/library/LibraryMethodIcon.jsx';
import { useShimeLanguage } from '../uiI18n/useShimeLanguage.js';

function getItemTypeLabels(t) {
  return {
    multiple_choice: t('library.multipleChoice'),
    short_answer: t('library.shortAnswer'),
    flashcard: t('library.flashcard')
  };
}

function getItemTypeCounts(items) {
  return items.reduce((counts, item) => {
    counts[item.type] = (counts[item.type] || 0) + 1;
    return counts;
  }, {});
}

function countEdugenDraftItems(items) {
  if (!Array.isArray(items)) return 0;
  let count = 0;
  for (const item of items) {
    if (item && isSafeEdugenSourceMetadata(item.sourceMetadata)) {
      count += 1;
    }
  }
  return count;
}

function getChoiceText(choice) {
  if (typeof choice === 'string') return choice;
  return choice?.text ?? choice?.label ?? choice?.value ?? '';
}

function isChoiceCorrect(choice, correctAnswer) {
  if (!correctAnswer) return false;
  const choiceText = getChoiceText(choice);
  const cleanChoice = String(typeof choice === 'string' ? choice : (choice?.id ?? choiceText ?? '')).toLowerCase().trim();
  const cleanExpected = String(correctAnswer).toLowerCase().trim();
  return cleanChoice === cleanExpected || String(choiceText).toLowerCase().trim() === cleanExpected;
}

function buildSubjectCards(adapter) {
  return adapter.getSubjects().map(subject => {
    const topics = adapter.getTopicsBySubject(subject.id);
    const items = adapter.getItemsBySubject(subject.id);

    return {
      subject,
      topics,
      items,
      itemTypeCounts: getItemTypeCounts(items),
      edugenDraftCount: countEdugenDraftItems(items)
    };
  });
}

function IssueList({ title, issues, tone }) {
  const { t } = useShimeLanguage();
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
      {issues.length > 8 ? <p className="muted">{t('library.moreIssues', { count: issues.length - 8 })}</p> : null}
    </div>
  );
}

const qualityToneByLevel = {
  error: 'danger',
  warning: 'warning',
  info: 'info'
};

function AiOutputReviewPanel({ review }) {
  const { t } = useShimeLanguage();
  if (!review) return null;

  const warnings = review.warnings || [];

  return (
    <div className="aiOutputReview" aria-label={t('library.externalReviewTitle')}>
      <div>
        <strong>{t('library.externalReviewTitle')}</strong>
        <p className="muted">{t('library.externalReviewBody')}</p>
      </div>
      {warnings.length ? (
        <ul className="aiOutputReview__list">
          {warnings.slice(0, 8).map((warning, index) => (
            <li key={`${warning.code}-${index}`} className={`aiOutputReview__item aiOutputReview__item--${qualityToneByLevel[warning.level] || 'warning'}`}>
              <Badge tone={qualityToneByLevel[warning.level] || 'warning'}>
                {warning.level === 'info' ? t('library.suggestion') : warning.level === 'error' ? t('library.needsReview') : t('library.warning')}
              </Badge>
              <span>{warning.message}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">{t('library.externalReviewClear')}</p>
      )}
      <p className="muted">{t('library.externalPasteBody')}</p>
    </div>
  );
}

function QualityReviewPanel({ review }) {
  const { t } = useShimeLanguage();
  if (!review) return null;

  const warnings = review.warnings || [];
  const { summary } = review;
  const seriousWarnings = warnings.filter(warning => warning.level !== 'info');
  const advisoryInfo = warnings.filter(warning => warning.level === 'info');

  return (
    <div className="qualityReview" aria-label={t('library.qualityTitle')}>
      <div className="qualityReview__header">
        <div>
          <strong>{t('library.qualityTitle')}</strong>
          <p className="muted">
            {warnings.length
              ? t('library.qualityNeedsReview')
              : t('library.qualityClear')}
          </p>
        </div>
        <div className="qualityReview__badges" aria-label={t('library.qualitySummary')}>
          <Badge tone={summary.errorCount ? 'danger' : warnings.length ? 'warning' : 'success'}>
            {warnings.length ? t('library.warningCount', { count: warnings.length }) : t('library.reviewReady')}
          </Badge>
          {summary.itemWarningCount ? <Badge tone="neutral">{t('library.itemReviewCount', { count: summary.itemWarningCount })}</Badge> : null}
        </div>
      </div>

      {warnings.length ? (
        <ul className="qualityReview__list">
          {[...seriousWarnings, ...advisoryInfo].slice(0, 10).map((warning, index) => (
            <li key={`${warning.code}-${warning.path}-${index}`} className={`qualityReview__item qualityReview__item--${qualityToneByLevel[warning.level] || 'warning'}`}>
              <Badge tone={qualityToneByLevel[warning.level] || 'warning'}>
                {warning.level === 'info' ? t('library.suggestion') : warning.level === 'error' ? t('library.needsReview') : t('library.warning')}
              </Badge>
              <span>{warning.message}</span>
              {warning.path ? <small>{warning.path}</small> : null}
            </li>
          ))}
        </ul>
      ) : null}

      {warnings.length > 10 ? <p className="muted">{t('library.moreIssues', { count: warnings.length - 10 })}</p> : null}
      <p className="muted">{t('library.qualityNote')}</p>
    </div>
  );
}

function ImportPreview({ preview, fileName, onConfirm, onCancel }) {
  const { t } = useShimeLanguage();
  if (!preview) return null;

  const { validation } = preview;
  const { summary, errors, warnings, canImport } = validation;
  const itemTypeEntries = Object.entries(summary.itemTypeCounts);
  const itemTypeLabels = getItemTypeLabels(t);
  const formatLabel = preview.format === 'csv'
    ? 'CSV'
    : preview.format === 'text'
      ? t('library.formatText')
      : preview.format === 'document'
        ? t('library.formatDocument')
        : 'JSON';

  return (
    <Card title={t('library.previewTitle')} eyebrow={t('library.previewEyebrow')} variant="elevated" className="importPreview">
      <div className="importPreview__header">
        <div>
          <p className="muted">{t('library.selectedFile')}</p>
          <strong>{fileName}</strong>
        </div>
        <div className="importPreview__badges" aria-label={t('library.importInfo')}>
          <Badge tone="info">{formatLabel}</Badge>
          <Badge tone={errors.length ? 'danger' : warnings.length ? 'warning' : 'success'}>
            {errors.length ? t('library.hasErrors') : warnings.length ? t('library.hasWarnings') : t('library.readyImport')}
          </Badge>
        </div>
      </div>

      <div className="importSummaryGrid" aria-label={t('library.importSummary')}>
        {preview.format === 'csv' ? <span>{t('library.csvRows', { count: preview.rowsParsed })}</span> : null}
        {preview.format === 'text' ? <span>{t('library.contentLines', { count: preview.linesParsed })}</span> : null}
        <span>{t('library.subjectCount', { count: summary.subjectCount })}</span>
        <span>{t('library.topicCount', { count: summary.topicCount })}</span>
        <span>{t('library.itemCount', { count: summary.itemCount })}</span>
        <span>{t('library.validItems', { count: summary.validItems })}</span>
      </div>

      {preview.sourceMetadata ? (
        <div className="importSourceMeta" aria-label={t('library.sourceMetadata')}>
          <span><strong>{t('library.sourceFile')}</strong> {preview.sourceMetadata.originalName || fileName}</span>
          {preview.sourceMetadata.fileType ? <span><strong>{t('library.fileType')}</strong> {preview.sourceMetadata.fileType}</span> : null}
          {Number.isFinite(preview.sourceMetadata.wordCount) ? <span><strong>{t('library.wordCount')}</strong> {preview.sourceMetadata.wordCount}</span> : null}
          {Number.isFinite(preview.sourceMetadata.lineCount) ? <span><strong>{t('library.lineCount')}</strong> {preview.sourceMetadata.lineCount}</span> : null}
          {preview.sourceMetadata.extractionMethod ? <span><strong>{t('library.extractionMethod')}</strong> {preview.sourceMetadata.extractionMethod}</span> : null}
        </div>
      ) : null}

      <div className="badgeList" aria-label={t('library.validTypeDistribution')}>
        {itemTypeEntries.length ? itemTypeEntries.map(([type, count]) => (
          <Badge key={type} tone="info">
            {itemTypeLabels[type] || type}: {count}
          </Badge>
        )) : <Badge tone="neutral">{t('library.noValidItems')}</Badge>}
      </div>

      <IssueList title={t('library.errorsToFix')} issues={errors} tone="danger" />
      <IssueList title={t('library.warning')} issues={warnings} tone="warning" />
      <QualityReviewPanel review={preview.qualityReview} />

      <div className="sampleItems" aria-label={t('library.sampleItemsLabel')}>
        <strong>{t('library.sampleItems')}</strong>
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
          <p className="muted">{t('library.noSampleItems')}</p>
        )}
      </div>

      <BackupBeforeImportNotice itemCount={summary.itemCount} />

      <div className="importPreview__actions">
        <Button type="button" onClick={onConfirm} disabled={!canImport}>
          {t('library.confirmImport')}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t('library.cancelPreview')}
        </Button>
      </div>
    </Card>
  );
}

export default function Library() {
  const navigate = useNavigate();
  const { locale, t } = useShimeLanguage();
  const itemTypeLabels = getItemTypeLabels(t);
  const adapter = useLearningDataAdapter();
  const dataSource = useLearningDataSource();
  const summary = useLearningDataSummary();
  const fileInputRef = useRef(null);
  const textFileInputRef = useRef(null);
  const documentFileInputRef = useRef(null);
  const [libraryTab, setLibraryTab] = useState('shelf');
  const [workshopMethod, setWorkshopMethod] = useState('demo');
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
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicIdFilter, setSelectedTopicIdFilter] = useState(null);

  const subjectCards = buildSubjectCards(adapter);
  const selectedSubjectCard = selectedSubjectId ? subjectCards.find(sc => sc.subject.id === selectedSubjectId) : null;
  if (selectedSubjectId && !selectedSubjectCard) {
    // Reset if it no longer exists
    setSelectedSubjectId(null);
  }

  const filteredItems = useMemo(() => {
    if (!selectedSubjectCard) return [];
    return selectedSubjectCard.items.filter(item => {
      if (selectedTopicIdFilter && item.topicId !== selectedTopicIdFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const promptMatch = String(item.prompt || '').toLowerCase().includes(query);
        const answerMatch = String(item.correctAnswer || item.answer || '').toLowerCase().includes(query);
        const topic = selectedSubjectCard.topics.find(t => t.id === item.topicId);
        const topicMatch = String(topic?.title || '').toLowerCase().includes(query);
        const tagsMatch = Array.isArray(item.tags)
          ? item.tags.some(t => String(t).toLowerCase().includes(query))
          : String(item.tags || '').toLowerCase().includes(query);
        return promptMatch || answerMatch || topicMatch || tagsMatch;
      }
      return true;
    });
  }, [selectedSubjectCard, selectedTopicIdFilter, searchQuery]);
  const sourceLabel = dataSource.sourceType === 'mock'
    ? t('overview.sourceSample')
    : dataSource.sourceType === 'csv'
      ? t('overview.sourceCsv')
      : dataSource.sourceType === 'json'
        ? t('overview.sourceJson')
         : t('overview.sourceImported');
  const importedTime = dataSource.importedAt
    ? new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dataSource.importedAt))
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
        title: t('library.noPracticeTitle'),
        description: t('library.noPracticeBody')
      });
      return;
    }

    navigate('/study-room', {
      state: {
        selection: {
          mode: 'smart-practice',
          source: 'weighted-practice',
          label: t('library.smartPracticeLabel'),
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
    setLibraryTab('workshop');
    fileInputRef.current?.click();
  }

  function openTextFilePicker() {
    setLibraryTab('workshop');
    textFileInputRef.current?.click();
  }

  function openDocumentFilePicker() {
    setLibraryTab('workshop');
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
      title: t('library.externalChecked'),
      description: review.summary.warningCount
        ? t('library.externalHasHints')
        : t('library.externalNoHints')
    });
  }

  function createTextDraftPreview(sourceText, sourceName, options = {}) {
    const {
      format = 'text',
      successTitle = t('library.draftCreated'),
      successDescription = t('library.draftReview'),
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
      title: result.validation.errors.length ? t('library.draftFailed') : successTitle,
      description: result.validation.errors.length
        ? t('library.draftUnclear')
        : successDescription
    });
    return result;
  }

  function parseTextDraft() {
    setIsParsingText(true);
    setImportStatus(null);

    try {
      setAiOutputReview(reviewManualAiOutputText(textDraft));
      createTextDraftPreview(textDraft, t('library.pastedContent'));
    } catch (error) {
      setPreview(null);
      setImportStatus({
        tone: 'danger',
        title: t('library.parseFailed'),
        description: error.message || t('library.parseFailedBody')
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
          title: t('library.unsupportedFormat'),
          description: t('library.textFormatsOnly')
        });
        return;
      }

      const text = await file.text();
      if (!text.trim()) {
        setPreview(null);
        setImportStatus({
          tone: 'warning',
          title: t('library.emptyFile'),
          description: t('library.emptyFileBody')
        });
        return;
      }

      createTextDraftPreview(text, file.name, {
        successDescription: t('library.fileReadSuccess')
      });
    } catch (error) {
      setPreview(null);
      setImportStatus({
        tone: 'danger',
        title: t('library.textReadFailed'),
        description: error.message || t('library.textReadFailed')
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
          title: t('library.unsupportedFormat'),
          description: t('library.documentFormatsOnly')
        });
        return;
      }

      const extractionResult = await extractSingleFile(file);
      if (!extractionResult.ok) {
        const isConnectionError = extractionResult.code === 'edugen_network_error';
        setPreview(null);
        setImportStatus({
          tone: 'danger',
          title: isConnectionError ? t('library.edugenUnavailable') : t('library.documentExtractFailed'),
          description: extractionResult.message || t('library.documentExtractFailedBody')
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
        successTitle: t('library.documentExtracted'),
        successDescription: t('library.documentExtractedBody'),
        sourceMetadata
      });
    } catch (error) {
      setPreview(null);
      setImportStatus({
        tone: 'danger',
        title: t('library.documentExtractFailed'),
        description: error.message || t('library.documentExtractFailedBody')
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
      title: result.ok ? t('library.templateCreated') : t('library.templateUnavailable'),
      description: result.ok
        ? t('library.templateCreatedBody')
        : (result.warnings[0]?.message || t('library.templateCheckBody'))
    });
  }

  async function copyManualAiPrompt() {
    if (!aiPromptResult?.ok || !aiPromptResult.prompt) return;

    try {
      await navigator.clipboard.writeText(aiPromptResult.prompt);
      setAiPromptStatus({
        tone: 'success',
        title: t('library.templateCopied'),
        description: t('library.templateCopiedBody')
      });
    } catch (error) {
      setAiPromptStatus({
        tone: 'warning',
        title: t('library.copyFailed'),
        description: t('library.copyFailedBody')
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
        fileName: t('library.sampleFileName'),
        format: 'json',
        rawData: result.rawData,
        validation: result.validation,
        qualityReview
      });
      setImportStatus({
        tone: result.validation.errors.length ? 'danger' : result.validation.warnings.length ? 'warning' : 'success',
        title: result.validation.errors.length ? t('library.sampleLoadFailed') : t('library.sampleLoaded'),
        description: result.validation.errors.length
          ? t('library.sampleInvalid')
          : t('library.sampleLoadedBody')
      });
    } catch (error) {
      setPreview(null);
      setImportStatus({
        tone: 'danger',
        title: t('library.sampleLoadFailed'),
        description: error.message || t('library.samplePreviewFailed')
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
        title: result.validation.errors.length ? t('library.importFailed') : t('library.fileRead', { format: format.toUpperCase() }),
        description: result.validation.errors.length
          ? t('library.fileStructureError')
          : t('library.fileReview')
      });
    } catch (error) {
      setPreview(null);
      setImportStatus({
        tone: 'danger',
        title: t('library.fileReadFailed'),
        description: error.message || t('library.fileReadFailedBody')
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
      title: result.ok ? t('library.importSaved') : t('library.importUnsaved'),
      description: result.ok
        ? preview.validation.warnings.length
          ? t('library.importSavedWarning')
          : preview.format === 'text'
            ? t('library.textSaved')
            : t('library.formatSaved', { format: preview.format?.toUpperCase() || t('common.local') })
        : t('library.localStorageFailed')
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
          title: t('library.exportBlocked'),
          description: t('library.exportBlockedBody')
        });
        return;
      }

      const filename = createLibraryBackupFileName();
      const downloadResult = downloadJsonFile(result.payload, filename);

      setImportStatus({
        tone: downloadResult.ok ? 'success' : 'danger',
        title: downloadResult.ok ? t('library.exported') : t('library.exportFailed'),
        description: downloadResult.ok
          ? t('library.exportedBody', { filename })
          : downloadResult.message || t('library.downloadBlocked')
      });
    } finally {
      setIsExportingLibrary(false);
    }
  }

  function resetImportedLibrary() {
    const confirmed = window.confirm(t('library.resetConfirm'));
    if (!confirmed) return;

    resetLearningDataToMock();
    resetPreview();
    setImportStatus({
      tone: 'success',
      title: t('library.resetDone'),
      description: t('library.resetDoneBody')
    });
  }

  return (
    <div className="pageStack phase37uid-library-shelf-modern-collection-cards-pilot">
      <PageHeader
        eyebrow={t('library.eyebrow')}
        title={t('library.title')}
        subtitle={t('library.subtitle')}
        actions={(
          <>
            <Button type="button" variant="secondary" onClick={() => openSmartPractice()} disabled={summary.itemCount === 0}>
              {t('library.smartPractice')}
            </Button>
          </>
        )}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,text/csv,.json,.csv"
        className="srOnly"
        tabIndex={-1}
        onChange={handleImportFile}
        aria-label={t('library.chooseJsonCsv')}
      />

      <input
        ref={textFileInputRef}
        type="file"
        accept=".txt,.md,text/plain,text/markdown,text/x-markdown"
        className="srOnly"
        tabIndex={-1}
        onChange={handleTextQuizFile}
        aria-label={t('library.chooseTextFile')}
      />

      <input
        ref={documentFileInputRef}
        type="file"
        accept=".pdf,.docx,.pptx,.zip,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip"
        className="srOnly"
        tabIndex={-1}
        onChange={handleDocumentDraftFile}
        aria-label={t('library.chooseDocument')}
      />

      <div role="tablist" className="libraryTabList phase36e-library-tabs-touch-pilot" aria-label={t('library.sections')}>
        <button
          id="library-tab-shelf"
          role="tab"
          type="button"
          aria-selected={libraryTab === 'shelf'}
          aria-controls="library-panel-shelf"
          className={`libraryTab${libraryTab === 'shelf' ? ' libraryTab--active' : ''}`}
          onClick={() => setLibraryTab('shelf')}
        >
          {t('library.shelfTab')}
        </button>
        <button
          id="library-tab-workshop"
          role="tab"
          type="button"
          aria-selected={libraryTab === 'workshop'}
          aria-controls="library-panel-workshop"
          className={`libraryTab${libraryTab === 'workshop' ? ' libraryTab--active' : ''}`}
          onClick={() => setLibraryTab('workshop')}
        >
          {t('library.addTab')}
        </button>
      </div>

      <div
        id="library-panel-shelf"
        role="tabpanel"
        aria-labelledby="library-tab-shelf"
        className="libraryTabPanel"
        hidden={libraryTab !== 'shelf'}
      >
        {selectedSubjectId && selectedSubjectCard ? (
          <div className="subjectDetailContainer">
            {/* Header */}
            <div className="subjectDetailHeader">
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedSubjectId(null)} className="backToShelfBtn">
                ← {t('library.backToShelf')}
              </Button>
              <div className="subjectDetailTitleArea">
                <h1 className="subjectDetailTitle">{selectedSubjectCard.subject.title}</h1>
                <p className="muted">{selectedSubjectCard.subject.description || t('library.noSubjectDescription')}</p>
              </div>
              <div className="subjectDetailActions">
                <Button type="button" variant="ghost" size="sm" onClick={() => openStudyPlaceholder(selectedSubjectCard.subject)}>
                  {t('library.studyInRoom')}
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => openSmartPractice(selectedSubjectCard.subject)} disabled={!selectedSubjectCard.items.length}>
                  {t('library.smartPractice')}
                </Button>
              </div>
            </div>

            {/* Search bar & filter status */}
            <div className="subjectDetailSearchBox">
              <div className="searchBarWrapper">
                <span className="searchIcon"><LibraryMethodIcon type="search" /></span>
                <input
                  type="search"
                  placeholder={t('library.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="subjectDetailSearchInput"
                />
                {searchQuery ? (
                  <button type="button" className="clearSearchBtn" onClick={() => setSearchQuery('')}>×</button>
                ) : null}
              </div>
            </div>

            {/* Main grid */}
            <div className="subjectDetailGrid">
              {/* Left Column: Topics */}
              <div className="subjectDetailSidebar">
                <h3>{t('library.topics', { count: selectedSubjectCard.topics.length })}</h3>
                <div className="subjectDetailTopicsList">
                  <button
                    type="button"
                    className={`topicFilterTab ${!selectedTopicIdFilter ? 'topicFilterTab--active' : ''}`}
                    onClick={() => setSelectedTopicIdFilter(null)}
                  >
                    <span>{t('library.allQuestions')}</span>
                    <Badge tone="neutral">{selectedSubjectCard.items.length}</Badge>
                  </button>
                  {selectedSubjectCard.topics.map(topic => {
                    const topicItems = selectedSubjectCard.items.filter(item => item.topicId === topic.id);
                    const isActive = selectedTopicIdFilter === topic.id;
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        className={`topicFilterTab ${isActive ? 'topicFilterTab--active' : ''}`}
                        onClick={() => setSelectedTopicIdFilter(isActive ? null : topic.id)}
                      >
                        <span>{topic.title}</span>
                        <Badge tone={isActive ? 'success' : 'neutral'}>{topicItems.length}</Badge>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Items */}
              <div className="subjectDetailContent">
                <div className="subjectDetailContentHeader">
                  <h3>{t('library.questionList', { count: filteredItems.length })}</h3>
                  {(selectedTopicIdFilter || searchQuery) && (
                    <button type="button" className="resetFiltersBtn" onClick={() => {
                      setSelectedTopicIdFilter(null);
                      setSearchQuery('');
                    }}>
                      {t('library.clearFilters')}
                    </button>
                  )}
                </div>

                {filteredItems.length === 0 ? (
                  <EmptyState
                    icon={<LibraryMethodIcon type="search" />}
                    title={t('library.noSearchTitle')}
                    description={t('library.noSearchBody')}
                  />
                ) : (
                  <div className="subjectDetailItemsList">
                    {filteredItems.map((item, idx) => {
                      const itemTopic = selectedSubjectCard.topics.find(t => t.id === item.topicId);
                      const itemChoices = Array.isArray(item.choices) ? item.choices : [];
                      return (
                        <div key={item.id || idx} className="subjectDetailItemCard">
                          <div className="itemCardHeader">
                            <Badge tone="info">{itemTypeLabels[item.type] || item.type}</Badge>
                            {itemTopic ? (
                              <Badge tone="neutral" className="itemTopicBadge">
                                {itemTopic.title}
                              </Badge>
                            ) : null}
                          </div>
                          
                          <div className="itemCardPrompt">
                            <strong>{t('library.questionLabel')}</strong>
                            <p>{item.prompt}</p>
                          </div>

                          {itemChoices.length > 0 ? (
                            <div className="itemCardChoices">
                              <strong>{t('library.choicesLabel')}</strong>
                              <ul>
                                {itemChoices.map((choice, cIdx) => {
                                  const text = getChoiceText(choice);
                                  const isCorrect = isChoiceCorrect(choice, item.correctAnswer);
                                  return (
                                    <li key={cIdx} className={isCorrect ? 'correctChoiceText' : ''}>
                                      <span className="choiceMarker">{String.fromCharCode(65 + cIdx)}.</span> {text}
                                      {isCorrect ? ' ✓' : ''}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ) : null}

                          <div className="itemCardAnswer">
                            <strong>{t('library.correctAnswerLabel')}</strong>
                            <p>{item.correctAnswer || item.answer || t('library.notConfigured')}</p>
                          </div>

                          {/* Tags/Keywords */}
                          {item.tags && (Array.isArray(item.tags) ? item.tags.length > 0 : String(item.tags).trim()) && (
                            <div className="itemCardTags">
                              <strong>{t('library.tagsLabel')}</strong>
                              <div className="tagList">
                                {(Array.isArray(item.tags) ? item.tags : String(item.tags).split(',')).map((tag, tIdx) => (
                                  <span key={tIdx} className="itemTag">#{tag.trim()}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {subjectCards.length === 0 ? (
              <Card title={t('library.emptyTitle')} eyebrow={t('library.emptyEyebrow')} className="libraryEmptyOnboardingCard">
                <div className="textImportCard__intro">
                  <p className="muted">
                    {t('library.emptyBody')}
                  </p>
                </div>
                <div className="textImportHelp" aria-label={t('library.emptyStartLabel')}>
                  <Badge tone="info">{t('library.methodSample')}</Badge>
                  <Badge tone="info">{t('library.importJsonCsv')}</Badge>
                  <Badge tone="info">{t('library.methodPaste')}</Badge>
                </div>
              </Card>
            ) : null}

            {subjectCards.length === 0 ? (
              <EmptyState
                icon="＋"
                title={t('library.emptyTitle')}
                description={t('library.emptyBody')}
                action={<Button type="button" variant="secondary" size="sm" onClick={() => setLibraryTab('workshop')}>{t('library.emptyAction')}</Button>}
              />
            ) : null}

            <div className="librarySubjectGrid" aria-label={t('library.subjectList')}>
              {subjectCards.map(({ subject, topics, items, edugenDraftCount }) => (
                <Card
                  key={subject.id}
                  title={subject.title}
                  eyebrow={t('library.subjectBook')}
                  variant="elevated"
                  interactive
                  onClick={() => {
                    setSelectedSubjectId(subject.id);
                    setSearchQuery('');
                    setSelectedTopicIdFilter(null);
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedSubjectId(subject.id);
                      setSearchQuery('');
                      setSelectedTopicIdFilter(null);
                    }
                  }}
                >
                  <div className="libraryCardBody">
                    <p className="muted" style={{ minHeight: '4.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {subject.description || t('library.noSubjectDescription')}
                    </p>
                    <div className="badgeList" style={{ marginBlock: 'var(--space-2)', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {edugenDraftCount > 0 ? (
                        <>
                          <Badge tone="warning">{t('library.draftNeedsReview', { count: edugenDraftCount })}</Badge>
                          <Badge tone="neutral">{t('library.sourceEduGen')}</Badge>
                        </>
                      ) : null}
                    </div>
                    <div className="libraryStats" aria-label={t('library.subjectStats', { subject: subject.title })} style={{ borderTop: '1px dashed var(--border)', paddingTop: 'var(--space-2)', marginTop: 'auto' }}>
                      <span>{t('library.topicCount', { count: topics.length })}</span>
                      <span>{t('library.itemCount', { count: items.length })}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      <div
        id="library-panel-workshop"
        role="tabpanel"
        aria-labelledby="library-tab-workshop"
        className="libraryTabPanel"
        hidden={libraryTab !== 'workshop'}
      >
        <header className="libraryWorkshopHeader">
          <p className="eyebrow">{t('library.addEyebrow')}</p>
          <h2>{t('library.addTitle')}</h2>
          <p>{t('library.addLead')}</p>
        </header>
        <div className="workshopMethodSelector" aria-label={t('library.addTitle')}>
          <button
            type="button"
            className={`workshopMethodTab ${workshopMethod === 'demo' ? 'workshopMethodTab--active' : ''}`}
            onClick={() => setWorkshopMethod('demo')}
          >
            <span className="icon"><LibraryMethodIcon type="sample" /></span>
            <div>
              <strong>{t('library.methodSample')}</strong>
              <p>{t('library.methodSampleHint')}</p>
            </div>
          </button>
          <button
            type="button"
            className={`workshopMethodTab ${workshopMethod === 'text' ? 'workshopMethodTab--active' : ''}`}
            onClick={() => setWorkshopMethod('text')}
          >
            <span className="icon"><LibraryMethodIcon type="paste" /></span>
            <div>
              <strong>{t('library.methodPaste')}</strong>
              <p>{t('library.methodPasteHint')}</p>
            </div>
          </button>
          <button
            type="button"
            className={`workshopMethodTab ${workshopMethod === 'file' ? 'workshopMethodTab--active' : ''}`}
            onClick={() => setWorkshopMethod('file')}
          >
            <span className="icon"><LibraryMethodIcon type="file" /></span>
            <div>
              <strong>{t('library.methodFile')}</strong>
              <p>{t('library.methodFileHint')}</p>
            </div>
          </button>
          <button
            type="button"
            className={`workshopMethodTab workshopMethodTab--secondary ${workshopMethod === 'prompt' ? 'workshopMethodTab--active' : ''}`}
            onClick={() => setWorkshopMethod('prompt')}
          >
            <span className="icon"><LibraryMethodIcon type="template" /></span>
            <div>
              <strong>{t('library.methodTemplate')}</strong>
              <p>{t('library.methodTemplateHint')}</p>
            </div>
          </button>
        </div>

        {workshopMethod === 'file' && (
          <>
            <Card title={t('library.manageTitle')} eyebrow={t('library.manageEyebrow')} className="libraryWorkshopActionsCard">
              <div className="textImportActions">
                <Button type="button" variant="secondary" loading={isReadingFile} onClick={openFilePicker}>
                  {t('library.importJsonCsv')}
                </Button>
                <Button type="button" variant="ghost" loading={isExportingLibrary} onClick={exportCurrentLibrary}>
                  {t('library.export')}
                </Button>
                {dataSource.sourceType !== 'mock' ? (
                  <Button type="button" variant="ghost" onClick={resetImportedLibrary}>
                    {t('library.removeImport')}
                  </Button>
                ) : null}
              </div>
            </Card>

            <Card title={t('library.documentTitle')} eyebrow={t('library.documentEyebrow')} className="documentImportCard">
              <div className="textImportCard__intro">
                <p className="muted">{t('library.documentDetail')}</p>
              </div>
              <div className="textFileImportActions">
                <Button type="button" variant="secondary" loading={isExtractingDocument} onClick={openDocumentFilePicker}>
                  {t('library.chooseDocumentButton')}
                </Button>
                <span className="muted">{t('library.documentSafety')}</span>
              </div>
            </Card>
          </>
        )}

        {workshopMethod === 'demo' && (
          <Card title={t('library.sampleTitle')} eyebrow={t('library.sampleEyebrow')} className="demoSampleQuickstartCard">
            <div className="textImportCard__intro">
              <div className="manualAiPromptWarning" role="note">
                <strong>{t('library.newUser')}</strong>
                <span>{t('library.sampleBody')}</span>
              </div>
              <details className="libraryInlineDetails">
                <summary>{t('library.howItWorks')}</summary>
                <p className="muted">{t('library.sampleDetail1')}</p>
                <p className="muted">{t('library.sampleDetail2')}</p>
                <p className="muted">{t('library.sampleDetail3')}</p>
              </details>
            </div>
            <div className="textImportActions">
              <Button type="button" variant="secondary" onClick={loadDemoSampleQuickstart}>
                {t('home.useSample')}
              </Button>
              <span className="muted">{t('library.sampleNoSave')}</span>
            </div>
          </Card>
        )}

        {workshopMethod === 'text' && (
          <>
            <Card title={t('library.pasteTitle')} eyebrow={t('library.pasteEyebrow')} className="textImportCard">
              <div className="textImportCard__intro">
                <p className="muted">{t('library.pasteIntro')}</p>
              </div>
              <label className="textImportField" htmlFor="text-quiz-draft-input">
                <span>{t('library.lessonContent')}</span>
                <textarea
                  id="text-quiz-draft-input"
                  value={textDraft}
                  onChange={event => {
                    setTextDraft(event.target.value);
                    setAiOutputReview(null);
                  }}
                  placeholder={locale === 'en'
                    ? 'Subject: Networking\nTopic: OSI\n\nQuestion: Which model includes the Application layer?\nA. OSI\nB. TCP/IP\nAnswer: A'
                    : 'Môn: Mạng máy tính\nChủ đề: OSI\n\nCâu hỏi: Application layer thuộc mô hình nào?\nA. OSI\nB. TCP/IP\nĐáp án: A'}
                  rows={10}
                />
              </label>
              <div className="textImportHelp" aria-label={t('library.formatHints')}>
                <Badge tone="info">{t('library.multipleChoice')} A, B, C, D</Badge>
                <Badge tone="info">{t('library.flashcard')}</Badge>
                <Badge tone="info">{t('library.shortAnswer')}</Badge>
                <Badge tone="neutral">Markdown # / ##</Badge>
              </div>
              <div className="textImportActions">
                <Button type="button" loading={isParsingText} onClick={parseTextDraft} disabled={!textDraft.trim()}>
                  {t('library.createDraft')}
                </Button>
                <Button type="button" variant="secondary" onClick={reviewManualAiPasteBack} disabled={!textDraft.trim()}>
                  {t('library.checkExternalOutput')}
                </Button>
                {textDraft.trim() ? (
                  <Button type="button" variant="ghost" onClick={resetTextDraftPreview}>
                    {t('library.clearPaste')}
                  </Button>
                ) : null}
              </div>
              <div className="manualAiPasteBackHint" role="note">
                <strong>{t('library.externalPasteTitle')}</strong>
                <span>{t('library.externalPasteBody')}</span>
              </div>
              <AiOutputReviewPanel review={aiOutputReview} />
            </Card>

            <Card title={t('library.textFileTitle')} eyebrow={t('library.textFileEyebrow')} className="textFileImportCard">
              <div className="textImportCard__intro">
                <p className="muted">{t('library.textFileIntro')}</p>
              </div>
              <div className="textFileImportActions">
                <Button type="button" variant="secondary" loading={isReadingTextFile} onClick={openTextFilePicker}>
                  {t('library.chooseTextButton')}
                </Button>
                <span className="muted">{t('library.textFileSupport')}</span>
              </div>
            </Card>
          </>
        )}

        {workshopMethod === 'prompt' && (
          <>
            <Card title={t('library.templateTitle')} eyebrow={t('library.templateEyebrow')} className="manualAiPromptCard">
              <div className="manualAiPromptCard__intro">
                <p className="muted">
                  {t('library.templateBody')}
                </p>
                <div className="manualAiPromptWarning" role="note">
                  <strong>{t('library.privacyNote')}</strong>
                  <span>{t('library.privacyExternal')}</span>
                </div>
              </div>

              <label className="textImportField" htmlFor="manual-ai-source-input">
                <span>{t('library.sourceForTemplate')}</span>
                <textarea
                  id="manual-ai-source-input"
                  value={aiPromptSource}
                  onChange={event => {
                    setAiPromptSource(event.target.value);
                    setAiPromptResult(null);
                    setAiPromptStatus(null);
                  }}
                  placeholder={t('library.templateSourcePlaceholder')}
                  rows={7}
                />
              </label>

              <div className="manualAiPromptOptions" aria-label={t('library.templateOptions')}>
                <label>
                  <span>{t('library.multipleChoice')}</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={aiPromptOptions.multipleChoiceCount}
                    onChange={event => updateAiPromptOption('multipleChoiceCount', event.target.value)}
                  />
                </label>
                <label>
                  <span>{t('library.flashcard')}</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={aiPromptOptions.flashcardCount}
                    onChange={event => updateAiPromptOption('flashcardCount', event.target.value)}
                  />
                </label>
                <label>
                  <span>{t('library.shortAnswer')}</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={aiPromptOptions.shortAnswerCount}
                    onChange={event => updateAiPromptOption('shortAnswerCount', event.target.value)}
                  />
                </label>
                <label>
                  <span>{t('library.language')}</span>
                  <select
                    value={aiPromptOptions.languageMode}
                    onChange={event => updateAiPromptOption('languageMode', event.target.value)}
                  >
                    <option value="keep_source">{t('library.keepSourceLanguage')}</option>
                    <option value="vi">{t('settings.vietnamese')}</option>
                  </select>
                </label>
              </div>

              <div className="textImportActions">
                <Button type="button" variant="secondary" onClick={generateManualAiPrompt} disabled={!aiPromptSource.trim()}>
                  {t('library.createTemplate')}
                </Button>
                <Button type="button" onClick={copyManualAiPrompt} disabled={!aiPromptResult?.ok}>
                  {t('library.copyTemplate')}
                </Button>
              </div>

              {aiPromptStatus ? <Toast tone={aiPromptStatus.tone} title={aiPromptStatus.title} description={aiPromptStatus.description} /> : null}

              {aiPromptResult?.warnings?.length ? (
                <div className="importIssues importIssues--warning">
                  <strong>{t('library.templateHints')}</strong>
                  <ul>
                    {aiPromptResult.warnings.map(warning => <li key={warning.code}>{warning.message}</li>)}
                  </ul>
                </div>
              ) : null}

              {aiPromptResult?.prompt ? (
                <label className="manualAiPromptPreview" htmlFor="manual-ai-prompt-preview">
                  <span>{t('library.createdTemplate')}</span>
                  <textarea id="manual-ai-prompt-preview" value={aiPromptResult.prompt} readOnly rows={12} />
                  <small>{t('library.templatePasteBack')}</small>
                </label>
              ) : null}
            </Card>

            <Card title={t('library.chooseImport')} eyebrow={t('library.quickGuide')} className="importMethodGuideCard">
              <div className="importMethodGuide" aria-label={t('library.importGuideLabel')}>
                <div>
                  <strong>{t('library.pasteMethod')}</strong>
                  <p className="muted">{t('library.pasteMethodBody')}</p>
                </div>
                <div>
                  <strong>{t('library.textMethod')}</strong>
                  <p className="muted">{t('library.textMethodBody')}</p>
                </div>
                <div>
                  <strong>{t('library.documentMethod')}</strong>
                  <p className="muted">{t('library.documentMethodBody')}</p>
                </div>
              </div>
              <p className="muted">{t('library.documentMethodNote')}</p>
            </Card>
          </>
        )}

        <Card title={t('library.sourceTitle')} eyebrow={t('library.sourceEyebrow')} className="dataSourceCard">
          <div className="dataSourceCard__content">
            <Badge tone={dataSource.sourceType === 'mock' ? 'neutral' : 'success'}>{sourceLabel}</Badge>
            <div>
              <strong>{dataSource.sourceType === 'mock' ? sourceLabel : dataSource.sourceName}</strong>
              <p className="muted">
                {importedTime ? t('library.lastImport', { time: importedTime }) : t('library.usingSample')}
              </p>
            </div>
          </div>
          <div className="sourceSummaryGrid" aria-label={t('library.exportSummary')}>
            <span>{t('library.subjectCount', { count: summary.subjectCount })}</span>
            <span>{t('library.topicCount', { count: summary.topicCount })}</span>
            <span>{t('library.itemCount', { count: summary.itemCount })}</span>
          </div>
        </Card>

        {dataSource.notice ? (
          <Toast tone="warning" title={t('library.dataNotice')} description={dataSource.notice} />
        ) : null}

        <details className="libraryTechnicalDisclosure libraryBackupDisclosure">
          <summary>{t('library.backupTools')}</summary>
          <V2BackupRestorePanel
            libraryData={adapter.data}
            librarySource={dataSource}
            librarySummary={summary}
          />
        </details>

        <details className="libraryTechnicalDisclosure">
          <summary>{t('library.technicalImport')}</summary>
          <Card title={t('library.schemaTitle')} eyebrow={t('library.schemaEyebrow')}>
            <p className="muted">
            {t('library.schemaBody')}
            </p>
          </Card>
        </details>

        <ImportPreview
          preview={preview}
          fileName={preview?.fileName}
          onConfirm={confirmImport}
          onCancel={resetPreview}
        />
      </div>

      {importStatus ? <Toast tone={importStatus.tone} title={importStatus.title} description={importStatus.description} /> : null}
    </div>
  );
}
