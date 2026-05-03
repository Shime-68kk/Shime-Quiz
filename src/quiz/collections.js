import { getJSON, removeStorageItem, setJSON } from '../utils/storage.js';
import { createQuestionKey } from './spacedRepetition.js';

export const COLLECTIONS_STORAGE_KEY = 'quizCollectionsV1';
export const MAX_COLLECTIONS = 100;
export const MAX_COLLECTION_QUESTIONS = 2000;

function createCollectionId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `collection-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function safeIsoDate(value, fallback = new Date().toISOString()) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

function normalizeName(name) {
  return String(name || '').trim().replace(/\s+/g, ' ').slice(0, 80);
}

function normalizeQuestionKeys(keys) {
  if (!Array.isArray(keys)) return [];

  const seen = new Set();
  const normalized = [];

  keys.forEach(key => {
    const value = String(key || '').trim();
    if (!value || seen.has(value)) return;
    seen.add(value);
    normalized.push(value);
  });

  return normalized.slice(0, MAX_COLLECTION_QUESTIONS);
}

function normalizeCollection(item) {
  if (!item || typeof item !== 'object') return null;

  const name = normalizeName(item.name);
  if (!name) return null;

  return {
    id: String(item.id || createCollectionId()),
    name,
    createdAt: safeIsoDate(item.createdAt),
    updatedAt: safeIsoDate(item.updatedAt || item.createdAt),
    questionKeys: normalizeQuestionKeys(item.questionKeys)
  };
}

function normalizeCollections(raw) {
  const source = Array.isArray(raw) ? raw : [];
  const seenIds = new Set();
  const collections = [];

  source.forEach(item => {
    try {
      const normalized = normalizeCollection(item);
      if (!normalized) return;
      if (seenIds.has(normalized.id)) normalized.id = createCollectionId();
      seenIds.add(normalized.id);
      collections.push(normalized);
    } catch {}
  });

  return collections
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, MAX_COLLECTIONS);
}

function saveCollections(items) {
  const normalized = normalizeCollections(items);
  setJSON(COLLECTIONS_STORAGE_KEY, normalized);
  return normalized;
}

export function loadCollections() {
  try {
    return normalizeCollections(getJSON(COLLECTIONS_STORAGE_KEY));
  } catch {
    removeStorageItem(COLLECTIONS_STORAGE_KEY);
    return [];
  }
}

export function createCollection(name) {
  const normalizedName = normalizeName(name);
  if (!normalizedName) return loadCollections();

  const now = new Date().toISOString();
  const collections = loadCollections();
  return saveCollections([
    {
      id: createCollectionId(),
      name: normalizedName,
      createdAt: now,
      updatedAt: now,
      questionKeys: []
    },
    ...collections
  ]);
}

export function addQuestionToCollection(collectionId, questionKey) {
  const key = String(questionKey || '').trim();
  if (!collectionId || !key) return loadCollections();

  const now = new Date().toISOString();
  return saveCollections(loadCollections().map(collection => {
    if (collection.id !== collectionId) return collection;
    if (collection.questionKeys.includes(key)) return collection;

    return {
      ...collection,
      updatedAt: now,
      questionKeys: [key, ...collection.questionKeys].slice(0, MAX_COLLECTION_QUESTIONS)
    };
  }));
}

export function removeQuestionFromCollection(collectionId, questionKey) {
  const key = String(questionKey || '').trim();
  if (!collectionId || !key) return loadCollections();

  const now = new Date().toISOString();
  return saveCollections(loadCollections().map(collection => {
    if (collection.id !== collectionId) return collection;

    return {
      ...collection,
      updatedAt: now,
      questionKeys: collection.questionKeys.filter(item => item !== key)
    };
  }));
}

export function isQuestionInCollection(collection, questionKey) {
  const key = String(questionKey || '').trim();
  return Boolean(key && collection?.questionKeys?.includes(key));
}

export function getQuestionCollectionMembership(questionKey, collections = loadCollections()) {
  const key = String(questionKey || '').trim();
  if (!key) return [];
  return collections.filter(collection => collection.questionKeys.includes(key));
}

export function getCollectionQuestionCount(collection) {
  return Array.isArray(collection?.questionKeys) ? collection.questionKeys.length : 0;
}

export function getCollectionQuestionKeySet(collection) {
  return new Set(Array.isArray(collection?.questionKeys) ? collection.questionKeys : []);
}

export function getQuestionKeyForCollection(question, quiz) {
  return createQuestionKey(question, quiz);
}

export function restoreCollections(items) {
  return saveCollections(Array.isArray(items) ? items : []);
}

export function clearCollections() {
  removeStorageItem(COLLECTIONS_STORAGE_KEY);
}
