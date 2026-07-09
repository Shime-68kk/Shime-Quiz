import { describe, expect, it } from 'vitest';
import {
  normalizeStudyNotificationPreferences,
  shouldSurfaceSubjectAlert
} from '../../src/studyRoom/studyNotificationPreferenceModel.js';

describe('studyNotificationPreferenceModel', () => {
  it('defaults to local-only disabled alerts', () => {
    expect(normalizeStudyNotificationPreferences()).toMatchObject({
      subjectForgettingAlertsEnabled: false,
      urgentOnly: true,
      localOnly: true
    });
  });

  it('normalizes per-subject overrides', () => {
    expect(normalizeStudyNotificationPreferences({
      subjectForgettingAlertsEnabled: true,
      urgentOnly: false,
      perSubjectOverrides: { math: { muted: true } }
    }).perSubjectOverrides.math).toEqual({ muted: true, urgentOnly: false });
  });

  it('surfaces only eligible local alerts', () => {
    const urgent = { subjectId: 'math', severity: 'urgent' };
    const info = { subjectId: 'math', severity: 'info' };
    const prefs = { subjectForgettingAlertsEnabled: true, urgentOnly: true };
    expect(shouldSurfaceSubjectAlert(urgent, prefs)).toBe(true);
    expect(shouldSurfaceSubjectAlert(info, prefs)).toBe(false);
    expect(shouldSurfaceSubjectAlert(urgent, { ...prefs, perSubjectOverrides: { math: { muted: true } } })).toBe(false);
  });
});
