export const MS_PER_DAY = 86400000;

export function normalizeDate(value, fallback = '') {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return fallback;
  return date.toISOString();
}

export function toTime(value, fallback = 0) {
  const time = value instanceof Date ? value.getTime() : new Date(value || '').getTime();
  return Number.isFinite(time) ? time : fallback;
}

export function getLocalDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value || Date.now());
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const year = safeDate.getFullYear();
  const month = String(safeDate.getMonth() + 1).padStart(2, '0');
  const day = String(safeDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function normalizeDateObject(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value || Date.now());
  return Number.isNaN(date.getTime()) ? new Date() : date;
}
