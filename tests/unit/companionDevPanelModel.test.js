import { describe, expect, it } from 'vitest';
import {
  createInitialCompanionPanelState,
  createInitialLiveTapPanelState,
  findForbiddenCompanionPanelKeys,
  formatCompanionDecisionForDisplay,
  formatLiveTapTranscriptEntry,
  formatPrivacyStatus,
  getCompanionDemoScenarios,
  isLiveTapSafeSnapshot,
  runCompanionPanelScenario,
  summarizeCompanionTranscript,
  summarizeLiveTapSnapshot
} from '../../src/components/settings/companionDevPanelModel.js';

describe('companionDevPanelModel', () => {
  it('starts disabled and fake-only', () => {
    expect(createInitialCompanionPanelState()).toMatchObject({
      enabled: false,
      observedCount: 0,
      acceptedCount: 0,
      rejectedCount: 0,
      blockedSensitiveCount: 0,
      fakeOnly: true,
      noExternalSend: true,
      noPersistence: true
    });
  });

  it('starts live tap disabled and observe-only', () => {
    expect(createInitialLiveTapPanelState()).toMatchObject({
      mode: 'live_devicebridge_observe_only',
      enabled: false,
      subscribed: false,
      observeOnly: true,
      noExternalSend: true,
      noPersistence: true,
      safe: true
    });
  });

  it('exposes safe scenario metadata without raw event payloads', () => {
    const scenarios = getCompanionDemoScenarios();

    expect(scenarios.map(scenario => scenario.id)).toEqual([
      'normal_session',
      'struggle_session',
      'review_due',
      'disconnected_error',
      'sensitive_attack'
    ]);
    expect(scenarios.every(scenario => !('events' in scenario))).toBe(true);
    expect(findForbiddenCompanionPanelKeys(scenarios)).toEqual([]);
  });

  it('marks the sensitive attack scenario invalid', () => {
    const sensitive = getCompanionDemoScenarios().find(scenario => scenario.id === 'sensitive_attack');

    expect(sensitive).toMatchObject({ invalid: true });
  });

  it('does not run scenarios before explicit enable', () => {
    const result = runCompanionPanelScenario('normal_session', { enabled: false });

    expect(result).toMatchObject({
      enabled: false,
      ignoredBeforeEnable: true,
      observedCount: 0,
      acceptedCount: 0,
      rejectedCount: 0
    });
    expect(result.transcript).toEqual([]);
  });

  it('running normal scenario produces redacted companion transcript decisions', () => {
    const result = runCompanionPanelScenario('normal_session', { enabled: true });

    expect(result.enabled).toBe(true);
    expect(result.observedCount).toBe(4);
    expect(result.acceptedCount).toBe(4);
    expect(result.rejectedCount).toBe(0);
    expect(result.transcript.length).toBe(4);
    expect(result.transcript[0]).toMatchObject({
      eventType: 'session_started',
      status: 'accepted',
      privacyStatus: 'dữ liệu đã làm mờ/rút gọn'
    });
  });

  it('running sensitive scenario blocks unsafe keys without exposing values', () => {
    const result = runCompanionPanelScenario('sensitive_attack', { enabled: true });
    const serialized = JSON.stringify(result);

    expect(result.observedCount).toBe(3);
    expect(result.acceptedCount).toBe(0);
    expect(result.rejectedCount).toBe(3);
    expect(result.blockedSensitiveCount).toBe(3);
    expect(result.transcript.every(entry => entry.status === 'rejected')).toBe(true);
    expect(result.transcript.every(entry => entry.privacyStatus === 'đã chặn bởi lớp bảo mật')).toBe(true);
    expect(serialized).not.toContain('private text');
    expect(serialized).not.toContain('private answer');
    expect(serialized).not.toContain('correctAnswer');
  });

  it('formats and summarizes transcript entries without raw payloads', () => {
    const summary = summarizeCompanionTranscript([
      {
        step: 1,
        inputEventType: 'answer_wrong',
        accepted: false,
        companionIntent: 'calm_error',
        tone: 'quiet',
        safetyOutcome: 'blocked',
        robotCommand: 'neutral',
        reasonCodes: ['forbidden_companion_key'],
        privacyStatus: 'blocked'
      }
    ]);

    expect(summary).toMatchObject({
      transcriptCount: 1,
      acceptedCount: 0,
      rejectedCount: 1,
      blockedSensitiveCount: 1
    });
    expect(formatPrivacyStatus({ privacyStatus: 'blocked' })).toBe('đã chặn bởi lớp bảo mật');
    expect(formatCompanionDecisionForDisplay(summary.transcript[0]).eventType).toBe('answer_wrong');
    expect(JSON.stringify(summary)).not.toContain('payload');
  });

  it('summarizes live tap snapshots into safe display rows', () => {
    const live = summarizeLiveTapSnapshot({
      runtimeEnabled: true,
      subscribed: true,
      observedEventCount: 1,
      acceptedEventCount: 1,
      rejectedEventCount: 0,
      lastInputEventType: 'session_started',
      lastCompanionIntent: 'focus_gently',
      lastRobotCommand: 'focus',
      lastSafetyOutcome: 'allowed'
    }, [
      {
        step: 1,
        inputEventType: 'session_started',
        accepted: true,
        companionIntent: 'focus_gently',
        tone: 'quiet',
        safetyOutcome: 'allowed',
        robotCommand: 'focus',
        reasonCodes: ['session_start'],
        privacyStatus: 'redacted_coarse_only'
      }
    ]);

    expect(live).toMatchObject({
      enabled: true,
      subscribed: true,
      observedCount: 1,
      acceptedCount: 1,
      rejectedCount: 0,
      blockedSensitiveCount: 0,
      safe: true
    });
    expect(formatLiveTapTranscriptEntry(live.transcript[0]).eventType).toBe('session_started');
    expect(isLiveTapSafeSnapshot(live)).toBe(true);
  });
});
