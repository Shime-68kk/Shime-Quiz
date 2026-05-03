import { APP_VERSION } from '../version.js';
import { validateLearningDataImport } from './importValidator.js';
import { LIBRARY_SCHEMA_VERSION } from './learningDataStore.js';

function padDatePart(value) {
  return String(value).padStart(2, '0');
}

export function createLibraryBackupFileName(date = new Date()) {
  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());
  return `shime-library-backup-${year}-${month}-${day}.json`;
}

function createSourceSummary(source = {}, summary = {}) {
  return {
    sourceType: source.sourceType || 'manual',
    sourceName: source.sourceName || 'Dữ liệu thư viện hiện tại',
    importedAt: source.importedAt || null,
    subjectCount: summary.subjectCount || 0,
    topicCount: summary.topicCount || 0,
    itemCount: summary.itemCount || 0
  };
}

export function createLibraryExportPayload(rawData, source = {}, summary = {}) {
  const validation = validateLearningDataImport(rawData);

  if (!validation.canImport) {
    return {
      ok: false,
      validation,
      payload: null,
      error: 'validation_failed'
    };
  }

  const normalizedData = validation.normalizedData;

  return {
    ok: true,
    validation,
    payload: {
      schemaVersion: LIBRARY_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      appVersion: APP_VERSION,
      sourceSummary: createSourceSummary(source, summary),
      subjects: normalizedData.subjects,
      topics: normalizedData.topics,
      items: normalizedData.items
    },
    error: null
  };
}

export function downloadJsonFile(payload, filename) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { ok: false, error: 'browser_unavailable' };
  }

  try {
    const text = JSON.stringify(payload, null, 2);
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { ok: true, filename };
  } catch (error) {
    return {
      ok: false,
      error: 'download_failed',
      message: error?.message || 'Không thể tạo file tải xuống.'
    };
  }
}
