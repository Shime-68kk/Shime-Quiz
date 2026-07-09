const DEFAULTS = Object.freeze({
  subjectForgettingAlertsEnabled: false,
  urgentOnly: true,
  quietHoursEnabled: false,
  quietHoursStart: '21:00',
  quietHoursEnd: '07:00',
  perSubjectOverrides: {},
  localOnly: true
});

function normalizeTime(value, fallback) {
  const text = typeof value === 'string' ? value.trim() : '';
  return /^\d{2}:\d{2}$/u.test(text) ? text : fallback;
}

export function normalizeStudyNotificationPreferences(raw = {}) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ...DEFAULTS };
  const perSubjectOverrides = {};
  if (raw.perSubjectOverrides && typeof raw.perSubjectOverrides === 'object' && !Array.isArray(raw.perSubjectOverrides)) {
    for (const [subjectId, override] of Object.entries(raw.perSubjectOverrides)) {
      const id = String(subjectId || '').trim();
      if (!id || !override || typeof override !== 'object' || Array.isArray(override)) continue;
      perSubjectOverrides[id] = {
        muted: override.muted === true,
        urgentOnly: override.urgentOnly === true
      };
    }
  }
  return {
    subjectForgettingAlertsEnabled: raw.subjectForgettingAlertsEnabled === true,
    urgentOnly: raw.urgentOnly !== false,
    quietHoursEnabled: raw.quietHoursEnabled === true,
    quietHoursStart: normalizeTime(raw.quietHoursStart, DEFAULTS.quietHoursStart),
    quietHoursEnd: normalizeTime(raw.quietHoursEnd, DEFAULTS.quietHoursEnd),
    perSubjectOverrides,
    localOnly: true
  };
}

export function shouldSurfaceSubjectAlert(alert = {}, preferences = {}) {
  const prefs = normalizeStudyNotificationPreferences(preferences);
  if (!prefs.subjectForgettingAlertsEnabled) return false;
  const override = prefs.perSubjectOverrides[String(alert.subjectId || '')];
  if (override?.muted) return false;
  if ((prefs.urgentOnly || override?.urgentOnly) && alert.severity !== 'urgent') return false;
  return true;
}
