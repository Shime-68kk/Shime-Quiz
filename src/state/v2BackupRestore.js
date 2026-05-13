import { validateLearningDataImport } from '../data/importValidator.js';
import { downloadJsonFile } from '../data/libraryExport.js';
import { LIBRARY_SCHEMA_VERSION, LIBRARY_STORAGE_KEY, setLearningData } from '../data/learningDataStore.js';
import { APP_VERSION } from '../version.js';
import { getLocalStorage } from '../utils/storage.js';
import { publishLearningStorageChanged } from './localStorageSync.js';
import { getSettings, normalizeSettings, importSettings } from './settingsStorage.js';
import {
  RECOMMENDATION_FEEDBACK_SCHEMA_VERSION,
  RECOMMENDATION_FEEDBACK_STORAGE_KEY,
  RECOMMENDATION_FEEDBACK_UPDATED_EVENT
} from './recommendationFeedbackStorage.js';
import {
  REVIEW_SCHEDULE_SCHEMA_VERSION,
  REVIEW_SCHEDULE_STORAGE_KEY,
  REVIEW_SCHEDULE_UPDATED_EVENT
} from './reviewScheduleStorage.js';
import {
  STUDY_GOAL_SCHEMA_VERSION,
  STUDY_GOAL_STORAGE_KEY,
  STUDY_GOAL_UPDATED_EVENT
} from './studyGoalStorage.js';
import {
  STUDY_HISTORY_SCHEMA_VERSION,
  STUDY_HISTORY_STORAGE_KEY,
  STUDY_HISTORY_UPDATED_EVENT
} from './studyHistoryStorage.js';
import {
  STUDY_PLAN_PROGRESS_SCHEMA_VERSION,
  STUDY_PLAN_PROGRESS_STORAGE_KEY,
  STUDY_PLAN_PROGRESS_UPDATED_EVENT
} from './studyPlanProgressStorage.js';

export const V2_BACKUP_SCHEMA_VERSION = 'shime-v2-backup-v1';

export const V2_BACKUP_MODES = Object.freeze({
  FULL: 'full',
  REDACTED_LIBRARY: 'redacted_library',
  PROGRESS_ONLY: 'progress_only'
});

const RESTORE_BLOCK_MESSAGES = Object.freeze({
  [V2_BACKUP_MODES.REDACTED_LIBRARY]: 'Bản sao lưu này không chứa đầy đủ đáp án nên không thể khôi phục như bản đầy đủ.',
  [V2_BACKUP_MODES.PROGRESS_ONLY]: 'Bản sao lưu tiến trình cần thư viện học tương ứng.'
});

const ANSWER_FIELD_NAMES = new Set([
  'correctAnswer',
  'answer',
  'acceptableAnswers',
  'back',
  'explanation',
  'isCorrect',
  'correct',
  'solution'
]);

function normalizeBackupMode(mode) {
  return Object.values(V2_BACKUP_MODES).includes(mode) ? mode : V2_BACKUP_MODES.FULL;
}

export function getV2BackupModeInfo(mode) {
  const backupMode = normalizeBackupMode(mode);
  return {
    backupMode,
    includesAnswers: backupMode === V2_BACKUP_MODES.FULL,
    redacted: backupMode === V2_BACKUP_MODES.REDACTED_LIBRARY,
    restoreSupported: backupMode === V2_BACKUP_MODES.FULL,
    restoreBlockMessage: RESTORE_BLOCK_MESSAGES[backupMode] || ''
  };
}

export function estimateJsonByteSize(value) {
  try {
    return new Blob([JSON.stringify(value ?? null)]).size;
  } catch {
    try {
      return JSON.stringify(value ?? null).length;
    } catch {
      return 0;
    }
  }
}

export function estimateV2BackupPayloadSize(payload) {
  const data = payload?.data && typeof payload.data === 'object' ? payload.data : {};
  const sections = Object.fromEntries(
    Object.keys(data).map(key => [key, estimateJsonByteSize(data[key])])
  );
  return {
    totalBytes: estimateJsonByteSize(payload),
    sections
  };
}

const SECTION_CONFIG = {
  studyHistory: {
    key: STUDY_HISTORY_STORAGE_KEY,
    schemaVersion: STUDY_HISTORY_SCHEMA_VERSION,
    eventName: STUDY_HISTORY_UPDATED_EVENT,
    arrayField: 'records',
    label: 'lịch sử học'
  },
  reviewSchedule: {
    key: REVIEW_SCHEDULE_STORAGE_KEY,
    schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION,
    eventName: REVIEW_SCHEDULE_UPDATED_EVENT,
    arrayField: 'records',
    label: 'lịch ôn tập'
  },
  recommendationFeedback: {
    key: RECOMMENDATION_FEEDBACK_STORAGE_KEY,
    schemaVersion: RECOMMENDATION_FEEDBACK_SCHEMA_VERSION,
    eventName: RECOMMENDATION_FEEDBACK_UPDATED_EVENT,
    arrayField: 'records',
    label: 'phản hồi gợi ý'
  },
  studyGoal: {
    key: STUDY_GOAL_STORAGE_KEY,
    schemaVersion: STUDY_GOAL_SCHEMA_VERSION,
    eventName: STUDY_GOAL_UPDATED_EVENT,
    objectField: 'goal',
    label: 'mục tiêu học tập'
  },
  studyPlanProgress: {
    key: STUDY_PLAN_PROGRESS_STORAGE_KEY,
    schemaVersion: STUDY_PLAN_PROGRESS_SCHEMA_VERSION,
    eventName: STUDY_PLAN_PROGRESS_UPDATED_EVENT,
    arrayField: 'days',
    label: 'tiến trình kế hoạch'
  }
};


function emitEvent(eventName, detail = {}) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

function publishRestoreStorageChanged(write) {
  if (!write?.key) return;
  publishLearningStorageChanged({
    key: write.key,
    section: write.section || '',
    reason: 'v2_backup_restored'
  });
}

function padDatePart(value) {
  return String(value).padStart(2, '0');
}

export function createV2BackupFileName(date = new Date()) {
  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());
  return `shime-v2-backup-${year}-${month}-${day}.json`;
}

function safeParseStoredJson(storage, key) {
  if (!storage) return null;
  const text = storage.getItem(key);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function getStoredSection(storage, config) {
  const payload = safeParseStoredJson(storage, config.key);
  if (!payload || typeof payload !== 'object') return null;
  if (payload.schemaVersion !== config.schemaVersion) return null;
  return payload;
}

function makeLibrarySection(rawData, source = {}, summary = {}) {
  const validation = validateLearningDataImport(rawData);
  if (!validation.canImport) {
    return { ok: false, error: 'library_invalid', validation };
  }

  return {
    ok: true,
    data: {
      schemaVersion: LIBRARY_SCHEMA_VERSION,
      metadata: {
        schemaVersion: LIBRARY_SCHEMA_VERSION,
        sourceType: source.sourceType || 'manual',
        sourceName: source.sourceName || 'Dữ liệu thư viện hiện tại',
        importedAt: source.importedAt || null
      },
      sourceSummary: {
        sourceType: source.sourceType || 'manual',
        sourceName: source.sourceName || 'Dữ liệu thư viện hiện tại',
        importedAt: source.importedAt || null,
        subjectCount: summary.subjectCount || validation.summary.subjectCount || 0,
        topicCount: summary.topicCount || validation.summary.topicCount || 0,
        itemCount: summary.itemCount || validation.summary.itemCount || 0
      },
      data: validation.normalizedData
    },
    validation
  };
}

function removeAnswerLikeFields(value) {
  if (Array.isArray(value)) return value.map(removeAnswerLikeFields);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !ANSWER_FIELD_NAMES.has(key))
      .map(([key, entry]) => [key, removeAnswerLikeFields(entry)])
  );
}

export function redactLibraryData(rawData = {}) {
  const validation = validateLearningDataImport(rawData);
  if (!validation.canImport) {
    return { ok: false, error: 'library_invalid', validation, data: null };
  }

  const normalizedData = validation.normalizedData;
  return {
    ok: true,
    validation,
    data: {
      subjects: removeAnswerLikeFields(normalizedData.subjects),
      topics: removeAnswerLikeFields(normalizedData.topics),
      items: normalizedData.items.map(item => removeAnswerLikeFields(item))
    }
  };
}

function makeRedactedLibrarySection(rawData, source = {}, summary = {}) {
  const redacted = redactLibraryData(rawData);
  if (!redacted.ok) return redacted;

  return {
    ok: true,
    data: {
      schemaVersion: LIBRARY_SCHEMA_VERSION,
      redacted: true,
      includesAnswers: false,
      metadata: {
        schemaVersion: LIBRARY_SCHEMA_VERSION,
        sourceType: source.sourceType || 'manual',
        sourceName: source.sourceName || 'Dữ liệu thư viện hiện tại',
        importedAt: source.importedAt || null,
        redactedAt: new Date().toISOString()
      },
      sourceSummary: {
        sourceType: source.sourceType || 'manual',
        sourceName: source.sourceName || 'Dữ liệu thư viện hiện tại',
        importedAt: source.importedAt || null,
        subjectCount: summary.subjectCount || redacted.validation.summary.subjectCount || 0,
        topicCount: summary.topicCount || redacted.validation.summary.topicCount || 0,
        itemCount: summary.itemCount || redacted.validation.summary.itemCount || 0
      },
      data: redacted.data
    },
    validation: redacted.validation
  };
}

function createLearningStateSections(storage) {
  return {
    studyHistory: getStoredSection(storage, SECTION_CONFIG.studyHistory) || {
      schemaVersion: STUDY_HISTORY_SCHEMA_VERSION,
      updatedAt: '',
      records: []
    },
    reviewSchedule: getStoredSection(storage, SECTION_CONFIG.reviewSchedule) || {
      schemaVersion: REVIEW_SCHEDULE_SCHEMA_VERSION,
      updatedAt: '',
      records: []
    },
    recommendationFeedback: getStoredSection(storage, SECTION_CONFIG.recommendationFeedback) || {
      schemaVersion: RECOMMENDATION_FEEDBACK_SCHEMA_VERSION,
      updatedAt: '',
      records: []
    },
    studyGoal: getStoredSection(storage, SECTION_CONFIG.studyGoal) || {
      schemaVersion: STUDY_GOAL_SCHEMA_VERSION,
      updatedAt: '',
      goal: null
    },
    studyPlanProgress: getStoredSection(storage, SECTION_CONFIG.studyPlanProgress) || {
      schemaVersion: STUDY_PLAN_PROGRESS_SCHEMA_VERSION,
      updatedAt: '',
      days: []
    }
  };
}

export function createV2BackupPayload({ libraryData, librarySource, librarySummary, mode = V2_BACKUP_MODES.FULL } = {}) {
  const storage = getLocalStorage();
  const backupMode = normalizeBackupMode(mode);
  const modeInfo = getV2BackupModeInfo(backupMode);
  const learningState = createLearningStateSections(storage);
  const data = { ...learningState };
  let validation = null;

  if (backupMode === V2_BACKUP_MODES.FULL) {
    const library = makeLibrarySection(libraryData || {}, librarySource || {}, librarySummary || {});
    if (!library.ok) {
      return { ok: false, error: library.error, validation: library.validation, payload: null };
    }
    data.library = library.data;
    validation = library.validation;
  }

  if (backupMode === V2_BACKUP_MODES.REDACTED_LIBRARY) {
    const library = makeRedactedLibrarySection(libraryData || {}, librarySource || {}, librarySummary || {});
    if (!library.ok) {
      return { ok: false, error: library.error, validation: library.validation, payload: null };
    }
    data.library = library.data;
    validation = library.validation;
  }

  const orderedData = backupMode === V2_BACKUP_MODES.PROGRESS_ONLY
    ? learningState
    : { library: data.library, ...learningState };
  const dataTypes = Object.keys(orderedData);

  return {
    ok: true,
    payload: {
      schemaVersion: V2_BACKUP_SCHEMA_VERSION,
      backupMode,
      includesAnswers: modeInfo.includesAnswers,
      redacted: modeInfo.redacted,
      appVersion: APP_VERSION,
      exportedAt: new Date().toISOString(),
      dataTypes,
      // Study drafts are intentionally excluded so stale in-progress sessions are not restored across library/history changes.
      includesStudyDraft: false,
      data: orderedData,
      settings: getSettings()
    },
    validation
  };
}

function issue(code, message, path = '') {
  return { code, message, path };
}

function validateLibrarySection(section, issues) {
  const rawData = section?.data && typeof section.data === 'object'
    ? section.data
    : {
        subjects: section?.subjects,
        topics: section?.topics,
        items: section?.items
      };
  const validation = validateLearningDataImport(rawData);
  if (!validation.canImport) {
    validation.errors.forEach(error => issues.push(issue(error.code, error.message, `data.library.${error.path || ''}`)));
    if (!validation.errors.length) issues.push(issue('library_invalid', 'Dữ liệu thư viện trong file sao lưu không hợp lệ.', 'data.library'));
    return null;
  }
  return validation.normalizedData;
}

function extractLibraryRawData(section) {
  if (!section || typeof section !== 'object') return null;
  return section?.data && typeof section.data === 'object'
    ? section.data
    : {
        subjects: section.subjects,
        topics: section.topics,
        items: section.items
      };
}

function validateRedactedLibrarySection(section, issues) {
  const rawData = extractLibraryRawData(section);
  if (!rawData || typeof rawData !== 'object') {
    issues.push(issue('library_invalid', 'Dữ liệu thư viện trong file sao lưu không hợp lệ.', 'data.library'));
    return null;
  }

  ['subjects', 'topics', 'items'].forEach(field => {
    if (!Array.isArray(rawData[field])) {
      issues.push(issue(`library_${field}_invalid`, `Phần thư viện đã ẩn đáp án phải chứa mảng ${field}.`, `data.library.${field}`));
    }
  });

  return rawData;
}

function validateEnvelopeSection(name, section, issues) {
  if (section == null) return null;
  if (!section || typeof section !== 'object' || Array.isArray(section)) {
    issues.push(issue(`${name}_invalid`, `Phần ${SECTION_CONFIG[name]?.label || name} không hợp lệ.`, `data.${name}`));
    return null;
  }

  const config = SECTION_CONFIG[name];
  if (section.schemaVersion !== config.schemaVersion) {
    issues.push(issue(`${name}_schema_invalid`, `Phiên bản schema của ${config.label} không hợp lệ.`, `data.${name}.schemaVersion`));
    return null;
  }

  if (config.arrayField && !Array.isArray(section[config.arrayField])) {
    issues.push(issue(`${name}_array_invalid`, `Phần ${config.label} phải chứa mảng ${config.arrayField}.`, `data.${name}.${config.arrayField}`));
    return null;
  }

  if (config.objectField && section[config.objectField] != null && typeof section[config.objectField] !== 'object') {
    issues.push(issue(`${name}_object_invalid`, `Phần ${config.label} có dữ liệu không hợp lệ.`, `data.${name}.${config.objectField}`));
    return null;
  }

  return section;
}

export function validateV2BackupPayload(payload) {
  const errors = [];
  const warnings = [];

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    errors.push(issue('backup_not_object', 'File sao lưu không hợp lệ.', ''));
    return { ok: false, errors, warnings, sections: {}, dataTypes: [], backupMode: V2_BACKUP_MODES.FULL, restoreSupported: false };
  }

  if (payload.schemaVersion !== V2_BACKUP_SCHEMA_VERSION) {
    errors.push(issue('backup_schema_invalid', 'File sao lưu không đúng phiên bản v2.', 'schemaVersion'));
  }

  const backupMode = normalizeBackupMode(payload.backupMode || V2_BACKUP_MODES.FULL);
  const modeInfo = getV2BackupModeInfo(backupMode);
  const data = payload.data && typeof payload.data === 'object' ? payload.data : {};
  if (!payload.data || typeof payload.data !== 'object') {
    errors.push(issue('backup_data_missing', 'File sao lưu thiếu phần dữ liệu.', 'data'));
  }

  const sections = {};
  if (backupMode === V2_BACKUP_MODES.FULL) {
    if (data.library) {
      const libraryData = validateLibrarySection(data.library, errors);
      if (libraryData) sections.library = libraryData;
    } else {
      errors.push(issue('library_missing', 'File sao lưu thiếu dữ liệu thư viện.', 'data.library'));
    }
  } else if (backupMode === V2_BACKUP_MODES.REDACTED_LIBRARY) {
    if (data.library) {
      const libraryData = validateRedactedLibrarySection(data.library, errors);
      if (libraryData) sections.library = libraryData;
    } else {
      errors.push(issue('library_missing', 'File sao lưu thiếu dữ liệu thư viện đã ẩn đáp án.', 'data.library'));
    }
    warnings.push(issue('restore_not_supported', RESTORE_BLOCK_MESSAGES[V2_BACKUP_MODES.REDACTED_LIBRARY], 'backupMode'));
  } else if (backupMode === V2_BACKUP_MODES.PROGRESS_ONLY) {
    warnings.push(issue('restore_not_supported', RESTORE_BLOCK_MESSAGES[V2_BACKUP_MODES.PROGRESS_ONLY], 'backupMode'));
  }

  Object.keys(SECTION_CONFIG).forEach(name => {
    const section = validateEnvelopeSection(name, data[name], errors);
    if (section) sections[name] = section;
  });

  const knownDataKeys = new Set(['library', ...Object.keys(SECTION_CONFIG)]);
  const unknownDataKeys = Object.keys(data).filter(key => !knownDataKeys.has(key));
  if (unknownDataKeys.length) {
    warnings.push(issue('unknown_sections_ignored', `Bỏ qua ${unknownDataKeys.length} phần dữ liệu không nhận diện được.`, 'data'));
  }

  // Optional settings envelope (Phase 14G). Missing payload.settings is not an error.
  let validatedSettings = null;
  if (payload.settings != null && typeof payload.settings === 'object' && !Array.isArray(payload.settings)) {
    validatedSettings = normalizeSettings(payload.settings);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    sections,
    dataTypes: Object.keys(sections),
    backupMode,
    includesAnswers: modeInfo.includesAnswers,
    redacted: modeInfo.redacted,
    restoreSupported: modeInfo.restoreSupported,
    restoreBlockMessage: modeInfo.restoreBlockMessage,
    settings: validatedSettings
  };
}

function writeRawSection(storage, name, section) {
  const config = SECTION_CONFIG[name];
  if (!config || !section) return { ok: true, skipped: true };
  try {
    storage.setItem(config.key, JSON.stringify(section));
    emitEvent(config.eventName, { reason: 'v2_backup_restored' });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: 'storage_write_failed', storageError: error, section: name };
  }
}

function getBackupSourceName(payload) {
  return `Bản sao lưu ${payload?.exportedAt ? new Date(payload.exportedAt).toLocaleDateString('vi-VN') : 'v2'}`;
}

function makeRestoredLibraryPayload(libraryData, payload) {
  const importedAt = new Date().toISOString();
  const sourceName = getBackupSourceName(payload);
  return {
    schemaVersion: LIBRARY_SCHEMA_VERSION,
    importedAt,
    sourceName,
    sourceType: 'backup',
    metadata: {
      schemaVersion: LIBRARY_SCHEMA_VERSION,
      importedAt,
      sourceName,
      sourceType: 'backup'
    },
    data: libraryData
  };
}

function createRestoreWrites(validation, payload) {
  const writes = [];
  const libraryPayload = makeRestoredLibraryPayload(validation.sections.library, payload);
  writes.push({ key: LIBRARY_STORAGE_KEY, value: JSON.stringify(libraryPayload), section: 'library' });

  Object.keys(SECTION_CONFIG).forEach(name => {
    if (!validation.sections[name]) return;
    const config = SECTION_CONFIG[name];
    writes.push({
      key: config.key,
      value: JSON.stringify(validation.sections[name]),
      section: name,
      eventName: config.eventName
    });
  });

  return writes;
}

function preflightRestoreWrites(storage, writes) {
  const probeKey = '__shime_v2_restore_probe__';
  try {
    storage.setItem(probeKey, writes.map(write => write.value).join('\n'));
    storage.removeItem(probeKey);
    return { ok: true };
  } catch (error) {
    try {
      storage.removeItem(probeKey);
    } catch {
      // Ignore cleanup failure; the restore will still be blocked safely.
    }
    return { ok: false, error: 'storage_preflight_failed', storageError: error };
  }
}

function snapshotRestoreKeys(storage, writes) {
  return new Map(writes.map(write => [write.key, storage.getItem(write.key)]));
}

function rollbackRestoreWrites(storage, snapshot) {
  const rollbackErrors = [];
  snapshot.forEach((value, key) => {
    try {
      if (value == null) storage.removeItem(key);
      else storage.setItem(key, value);
    } catch (error) {
      rollbackErrors.push({ key, error });
    }
  });
  return rollbackErrors;
}

function emitRestoreEvents(writes) {
  writes.forEach(write => {
    if (write.eventName) emitEvent(write.eventName, { reason: 'v2_backup_restored' });
    publishRestoreStorageChanged(write);
  });
}

export function restoreV2BackupPayload(payload) {
  const validation = validateV2BackupPayload(payload);
  if (!validation.ok) return { ok: false, validation, error: 'validation_failed' };
  if (!validation.restoreSupported) {
    return { ok: false, validation, error: 'unsupported_backup_mode', message: validation.restoreBlockMessage };
  }

  const storage = getLocalStorage();
  if (!storage) return { ok: false, validation, error: 'storage_unavailable' };

  const writes = createRestoreWrites(validation, payload);
  const preflight = preflightRestoreWrites(storage, writes);
  if (!preflight.ok) {
    return { ok: false, validation, error: preflight.error, storageError: preflight.storageError };
  }

  const snapshot = snapshotRestoreKeys(storage, writes);
  const writtenSections = [];

  try {
    writes.forEach(write => {
      storage.setItem(write.key, write.value);
      writtenSections.push(write.section);
    });
  } catch (error) {
    const rollbackErrors = rollbackRestoreWrites(storage, snapshot);
    return {
      ok: false,
      validation,
      error: 'restore_write_failed',
      storageError: error,
      writtenSections,
      rollbackOk: rollbackErrors.length === 0,
      rollbackErrors
    };
  }

  const libraryResult = setLearningData(validation.sections.library, {
    sourceType: 'backup',
    sourceName: getBackupSourceName(payload),
    skipStorage: true
  });

  if (!libraryResult.ok) {
    const rollbackErrors = rollbackRestoreWrites(storage, snapshot);
    return {
      ok: false,
      validation,
      error: 'library_restore_failed',
      libraryResult,
      writtenSections,
      rollbackOk: rollbackErrors.length === 0,
      rollbackErrors
    };
  }

  emitRestoreEvents(writes);

  // Restore settings if present. Non-fatal: settings failure must not undo the main restore.
  if (validation.settings) {
    try { importSettings(validation.settings); } catch { /* non-fatal */ }
  }

  return { ok: true, validation, writtenSections };
}

export function parseV2BackupJson(text) {
  try {
    const payload = JSON.parse(text);
    const validation = validateV2BackupPayload(payload);
    return { ok: validation.ok, payload, validation, error: validation.ok ? null : 'validation_failed' };
  } catch (error) {
    return {
      ok: false,
      payload: null,
      validation: {
        ok: false,
        errors: [issue('json_parse_failed', 'File sao lưu không phải JSON hợp lệ.', '')],
        warnings: [],
        sections: {},
        dataTypes: []
      },
      error: 'json_parse_failed',
      parseError: error
    };
  }
}

export function downloadV2Backup(payload, filename = createV2BackupFileName()) {
  return downloadJsonFile(payload, filename);
}
