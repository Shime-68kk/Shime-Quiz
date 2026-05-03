export function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function clamp(value, min = 0, max = 100, fallback = min) {
  const number = safeNumber(value, fallback);
  return Math.min(max, Math.max(min, number));
}

export function clampInteger(value, min = 0, max = Number.MAX_SAFE_INTEGER, fallback = min) {
  return Math.round(clamp(value, min, max, fallback));
}

export function toNonNegativeInteger(value, fallback = 0) {
  return Math.max(0, Math.floor(safeNumber(value, fallback)));
}
