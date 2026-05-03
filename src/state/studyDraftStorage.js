import { getLocalStorage } from '../utils/storage.js';
import { hashString } from '../utils/hash.js';
export const STUDY_DRAFT_STORAGE_KEY = 'shimeV2StudyDraftV1';
export const STUDY_DRAFT_SCHEMA_VERSION = 'v2-study-draft-v1';
export const DEFAULT_STUDY_DRAFT_MODE = 'standard';



function getItemIdentity(item, index) {
  return `${item?.id || `index-${index}`}:${item?.type || 'unknown'}:${item?.topicId || 'no-topic'}`;
}

export function createItemSetFingerprint(items = [], mode = DEFAULT_STUDY_DRAFT_MODE) {
  const safeMode = String(mode || DEFAULT_STUDY_DRAFT_MODE);
  if (!Array.isArray(items) || !items.length) return `${safeMode}:empty`;
  const identity = items.map(getItemIdentity).join('|');
  return `${safeMode}:items:${items.length}:${hashString(identity)}`;
}

function makeIdSet(items = []) {
  return new Set(items.map(item => String(item?.id || '')).filter(Boolean));
}

function sanitizeStringMap(value, allowedIds) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([itemId]) => allowedIds.has(String(itemId)))
      .map(([itemId, answer]) => [String(itemId), String(answer ?? '')])
  );
}

function sanitizeBooleanMap(value, allowedIds) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([itemId]) => allowedIds.has(String(itemId)))
      .map(([itemId, flag]) => [String(itemId), Boolean(flag)])
  );
}

export function clearStudyDraft() {
  const storage = getLocalStorage();
  if (!storage) return { ok: false, error: 'storage_unavailable' };

  try {
    storage.removeItem(STUDY_DRAFT_STORAGE_KEY);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: 'storage_remove_failed', storageError: error };
  }
}

export function readStudyDraftForItems(items = [], options = {}) {
  const storage = getLocalStorage();
  const mode = options.mode || DEFAULT_STUDY_DRAFT_MODE;
  const fingerprint = createItemSetFingerprint(items, mode);
  const allowedIds = makeIdSet(items);

  if (!storage) return { ok: false, restored: false, error: 'storage_unavailable', fingerprint };
  if (!Array.isArray(items) || !items.length) return { ok: false, restored: false, error: 'empty_item_set', fingerprint };

  const text = storage.getItem(STUDY_DRAFT_STORAGE_KEY);
  if (!text) return { ok: true, restored: false, fingerprint };

  try {
    const payload = JSON.parse(text);

    if (payload?.schemaVersion !== STUDY_DRAFT_SCHEMA_VERSION || payload?.itemSetFingerprint !== fingerprint) {
      clearStudyDraft();
      return { ok: false, restored: false, discarded: true, error: 'fingerprint_mismatch', fingerprint };
    }

    const currentItemIndex = Number.isFinite(payload.currentItemIndex)
      ? Math.max(0, Math.min(items.length - 1, Number(payload.currentItemIndex)))
      : 0;

    return {
      ok: true,
      restored: true,
      fingerprint,
      draft: {
        schemaVersion: STUDY_DRAFT_SCHEMA_VERSION,
        mode,
        itemSetFingerprint: fingerprint,
        currentItemIndex,
        answersByItemId: sanitizeStringMap(payload.answersByItemId, allowedIds),
        checkedByItemId: sanitizeBooleanMap(payload.checkedByItemId, allowedIds),
        flashcardRevealedByItemId: sanitizeBooleanMap(payload.flashcardRevealedByItemId, allowedIds),
        startedAt: payload.startedAt || new Date().toISOString(),
        updatedAt: payload.updatedAt || null
      }
    };
  } catch (error) {
    clearStudyDraft();
    return { ok: false, restored: false, discarded: true, error: 'draft_parse_failed', storageError: error, fingerprint };
  }
}

export function saveStudyDraftForItems(items = [], draft = {}, options = {}) {
  const storage = getLocalStorage();
  if (!storage) return { ok: false, error: 'storage_unavailable' };
  if (!Array.isArray(items) || !items.length) return { ok: false, error: 'empty_item_set' };

  const mode = options.mode || draft.mode || DEFAULT_STUDY_DRAFT_MODE;
  const fingerprint = createItemSetFingerprint(items, mode);
  const allowedIds = makeIdSet(items);
  const now = new Date().toISOString();
  const currentItemIndex = Number.isFinite(draft.currentItemIndex)
    ? Math.max(0, Math.min(items.length - 1, Number(draft.currentItemIndex)))
    : 0;

  const payload = {
    schemaVersion: STUDY_DRAFT_SCHEMA_VERSION,
    mode,
    itemSetFingerprint: fingerprint,
    currentItemIndex,
    answersByItemId: sanitizeStringMap(draft.answersByItemId, allowedIds),
    checkedByItemId: sanitizeBooleanMap(draft.checkedByItemId, allowedIds),
    flashcardRevealedByItemId: sanitizeBooleanMap(draft.flashcardRevealedByItemId, allowedIds),
    startedAt: draft.startedAt || now,
    updatedAt: now
  };

  try {
    storage.setItem(STUDY_DRAFT_STORAGE_KEY, JSON.stringify(payload));
    return { ok: true, draft: payload };
  } catch (error) {
    return { ok: false, error: 'storage_write_failed', storageError: error };
  }
}
