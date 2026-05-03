import { getJSON, removeStorageItem, setJSON } from "../utils/storage.js";

export const STORAGE_KEY = "shimechamhoc_progress_v1";

export function saveProgressData(data) {
  return setJSON(STORAGE_KEY, data);
}

export function loadProgressData() {
  return getJSON(STORAGE_KEY);
}

export function clearProgressData() {
  removeStorageItem(STORAGE_KEY);
}

export function createDebouncedProgressSaver(saveFn, delay = 600) {
  let t = null;
  return () => {
    clearTimeout(t);
    t = setTimeout(() => {
      try {
        saveFn();
      } catch {}
    }, delay);
  };
}
