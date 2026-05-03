export function normalizeAnswerText(value) {
  return String(value ?? '').trim().toLowerCase();
}

export function normalizeText(value) {
  return String(value ?? '').trim();
}
