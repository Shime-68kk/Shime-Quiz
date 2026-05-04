import { useMemo, useSyncExternalStore } from 'react';
import { createLearningDataAdapter, normalizeLearningData, summarizeLearningData } from './learningDataAdapter.js';
import { validateLearningDataImport } from './importValidator.js';
import mockLearningData from './mockLearningData.js';
import { getLocalStorage } from '../utils/storage.js';

export const LIBRARY_STORAGE_KEY = 'shimeV2LibraryDataV1';
export const LIBRARY_SCHEMA_VERSION = 'v2-library-data-v1';

const listeners = new Set();

function createMockMetadata(notice) {
  return {
    schemaVersion: LIBRARY_SCHEMA_VERSION,
    sourceType: 'mock',
    sourceName: 'Dữ liệu mẫu',
    importedAt: null,
    notice: notice || null
  };
}

function createImportMetadata({ sourceName, sourceType } = {}) {
  return {
    schemaVersion: LIBRARY_SCHEMA_VERSION,
    sourceType: sourceType || 'manual',
    sourceName: sourceName || 'Dữ liệu đã nạp',
    importedAt: new Date().toISOString(),
    notice: null
  };
}

function makePersistedPayload(rawData, metadata) {
  const normalizedData = normalizeLearningData(rawData);
  return {
    schemaVersion: LIBRARY_SCHEMA_VERSION,
    importedAt: metadata.importedAt,
    sourceName: metadata.sourceName,
    sourceType: metadata.sourceType,
    metadata: {
      schemaVersion: LIBRARY_SCHEMA_VERSION,
      importedAt: metadata.importedAt,
      sourceName: metadata.sourceName,
      sourceType: metadata.sourceType
    },
    data: normalizedData
  };
}

function readPersistedLibrary() {
  const storage = getLocalStorage();
  if (!storage) {
    return {
      data: mockLearningData,
      metadata: createMockMetadata('Bộ nhớ cục bộ không khả dụng; đang dùng dữ liệu mẫu.')
    };
  }

  const text = storage.getItem(LIBRARY_STORAGE_KEY);
  if (!text) {
    return { data: mockLearningData, metadata: createMockMetadata() };
  }

  try {
    const payload = JSON.parse(text);
    const rawData = payload?.data && typeof payload.data === 'object'
      ? payload.data
      : {
          subjects: payload?.subjects,
          topics: payload?.topics,
          items: payload?.items
        };
    const validation = validateLearningDataImport(rawData);

    if (!validation.canImport) {
      return {
        data: mockLearningData,
        metadata: createMockMetadata('Dữ liệu thư viện đã lưu bị lỗi schema; đã quay về dữ liệu mẫu.')
      };
    }

    return {
      data: validation.normalizedData,
      metadata: {
        schemaVersion: payload?.metadata?.schemaVersion || payload?.schemaVersion || LIBRARY_SCHEMA_VERSION,
        sourceType: payload?.metadata?.sourceType || payload?.sourceType || 'manual',
        sourceName: payload?.metadata?.sourceName || payload?.sourceName || 'Dữ liệu đã nạp',
        importedAt: payload?.metadata?.importedAt || payload?.importedAt || null,
        notice: null
      }
    };
  } catch {
    return {
      data: mockLearningData,
      metadata: createMockMetadata('Không đọc được dữ liệu thư viện đã lưu; đã quay về dữ liệu mẫu.')
    };
  }
}

const initialLibrary = readPersistedLibrary();
let currentLearningData = initialLibrary.data;
let currentMetadata = initialLibrary.metadata;

function emitChange() {
  listeners.forEach(listener => listener());
}

export function subscribeLearningData(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getLearningDataSnapshot() {
  return currentLearningData;
}

export function getLearningDataMetadataSnapshot() {
  return currentMetadata;
}

export function setLearningData(rawData, options = {}) {
  const validation = validateLearningDataImport(rawData);

  if (!validation.canImport) {
    currentMetadata = {
      ...currentMetadata,
      notice: 'Không lưu dữ liệu đã nạp vì cấu trúc chưa hợp lệ.'
    };
    emitChange();
    return { ok: false, validation, error: 'validation_failed' };
  }

  const metadata = createImportMetadata(options);
  const payload = makePersistedPayload(validation.normalizedData, metadata);
  const storage = getLocalStorage();

  if (storage && !options.skipStorage) {
    try {
      storage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      currentLearningData = validation.normalizedData;
      currentMetadata = {
        ...metadata,
        notice: 'Đã nạp vào phiên hiện tại nhưng không thể lưu cục bộ. Có thể trình duyệt đã hết dung lượng.'
      };
      emitChange();
      return { ok: false, validation, error: 'storage_write_failed', storageError: error };
    }
  }

  currentLearningData = validation.normalizedData;
  currentMetadata = metadata;
  emitChange();
  return { ok: true, validation, metadata };
}

export function resetLearningDataToMock() {
  const storage = getLocalStorage();
  if (storage) {
    try {
      storage.removeItem(LIBRARY_STORAGE_KEY);
    } catch {
      // The in-memory reset is still safe even when storage removal fails.
    }
  }

  currentLearningData = mockLearningData;
  currentMetadata = createMockMetadata('Đã xóa dữ liệu đã nạp trong v2 và quay về dữ liệu mẫu.');
  emitChange();
  return { ok: true };
}

export function useLearningDataAdapter() {
  const rawData = useSyncExternalStore(
    subscribeLearningData,
    getLearningDataSnapshot,
    getLearningDataSnapshot
  );

  return useMemo(() => createLearningDataAdapter(rawData), [rawData]);
}

export function useLearningDataSummary() {
  const rawData = useSyncExternalStore(
    subscribeLearningData,
    getLearningDataSnapshot,
    getLearningDataSnapshot
  );

  return useMemo(() => summarizeLearningData(rawData), [rawData]);
}

export function useLearningDataSource() {
  return useSyncExternalStore(
    subscribeLearningData,
    getLearningDataMetadataSnapshot,
    getLearningDataMetadataSnapshot
  );
}
