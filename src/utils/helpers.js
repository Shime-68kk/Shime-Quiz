export function strip(s) {
  return (s ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(t));
}

export function clampInt(n, min, max) {
  n = Number(n);
  if (!Number.isFinite(n)) n = min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickRandom(arr, k) {
  const copy = arr.slice();
  shuffleInPlace(copy);
  return copy.slice(0, Math.max(0, Math.min(k, copy.length)));
}

export function shortTitle(s, max = 50) {
  s = String(s || "");
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

export function previewText(s, max = 70) {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  return t.length > max ? (t.slice(0, max - 1) + "…") : t;
}

export function deepClone(value) {
  return window.structuredClone
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}
