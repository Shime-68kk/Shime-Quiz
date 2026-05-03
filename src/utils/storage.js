export function getLocalStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getStorageItem(key) {
  const storage = getLocalStorage();
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function setStorageItem(key, value) {
  const storage = getLocalStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeStorageItem(key) {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {}
}

export function parseJsonSafely(text, fallback = null) {
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export function getJSON(key) {
  const raw = getStorageItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    removeStorageItem(key);
    try {
      window.dispatchEvent(new CustomEvent('app-storage-recovered', { detail: { key } }));
    } catch {}
    return null;
  }
}

export function setJSON(key, value) {
  return setStorageItem(key, JSON.stringify(value));
}
