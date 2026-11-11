import { getStorageItem, setStorageItem, removeStorageItem, parseJsonSafely } from '../utils/storage.js';

// Everything stays in this browser: no account, no server.
export const CRAM_PROFILE_KEY = 'shimeCramProfileV1';
const STATE_KEY_PREFIX = 'shimeCramFsrsV1';

export const PROFILE_LE_THUY = 'le-thuy';
export const PROFILE_GUEST = 'guest';

export function readCramProfile() {
  const value = parseJsonSafely(getStorageItem(CRAM_PROFILE_KEY), null);
  if (!value || (value.id !== PROFILE_LE_THUY && value.id !== PROFILE_GUEST)) return null;
  return value;
}

export function saveCramProfile(id) {
  const profile = {
    id,
    name: id === PROFILE_LE_THUY ? 'Lệ Thủy' : '',
    chosenAt: new Date().toISOString()
  };
  setStorageItem(CRAM_PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export function clearCramProfile() {
  removeStorageItem(CRAM_PROFILE_KEY);
}

function stateKey(profileId, deckVersion) {
  return `${STATE_KEY_PREFIX}:${profileId}:${deckVersion}`;
}

export function readCramStates(profileId, deckVersion) {
  const value = parseJsonSafely(getStorageItem(stateKey(profileId, deckVersion)), null);
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export function saveCramStates(profileId, deckVersion, states) {
  return setStorageItem(stateKey(profileId, deckVersion), JSON.stringify(states || {}));
}

export function resetCramStates(profileId, deckVersion) {
  removeStorageItem(stateKey(profileId, deckVersion));
}

// Learner preferences (per device). revealMode:
//   'check'   → chọn đáp án rồi bấm "Kiểm tra" mới hiện đúng/sai (mặc định, đỡ bất ngờ)
//   'instant' → hiện đúng/sai ngay khi chạm vào đáp án
const PREFS_KEY = 'shimeCramPrefsV1';
export const REVEAL_CHECK = 'check';
export const REVEAL_INSTANT = 'instant';

export function readCramPrefs() {
  const value = parseJsonSafely(getStorageItem(PREFS_KEY), null) || {};
  return {
    revealMode: value.revealMode === REVEAL_INSTANT ? REVEAL_INSTANT : REVEAL_CHECK,
    guideSeen: value.guideSeen === true
  };
}

export function saveCramPrefs(prefs) {
  const next = { ...readCramPrefs(), ...(prefs || {}) };
  setStorageItem(PREFS_KEY, JSON.stringify(next));
  return next;
}

// Mock test results (per learner): newest first, last 10 kept.
function mockKey(profileId, deckVersion) {
  return `shimeCramMockV1:${profileId}:${deckVersion}`;
}

export function readMockResults(profileId, deckVersion) {
  const value = parseJsonSafely(getStorageItem(mockKey(profileId, deckVersion)), []);
  return Array.isArray(value) ? value : [];
}

export function saveMockResult(profileId, deckVersion, result) {
  const next = [{ ...result, at: new Date().toISOString() }, ...readMockResults(profileId, deckVersion)].slice(0, 10);
  setStorageItem(mockKey(profileId, deckVersion), JSON.stringify(next));
  return next;
}
