import { describe, expect, it } from 'vitest';
import {
  createV2PanelSnapshot,
  runV2DryRunFromTranscript,
  toV2PanelRows
} from '../../src/components/settings/companionV2PanelAdapter.js';

const normalTranscript = [
  { step: 1, eventType: 'session_started', status: 'accepted', companionIntent: 'focus_gently', robotCommand: 'focus', reasonCodes: ['study_focus'], privacyStatus: 'dữ liệu đã làm mờ/rút gọn' },
  { step: 2, eventType: 'answer_correct', status: 'accepted', companionIntent: 'celebrate_small', robotCommand: 'celebrate', reasonCodes: ['positive_streak'], privacyStatus: 'dữ liệu đã làm mờ/rút gọn' }
];

describe('companionV2PanelAdapter', () => {
  it('returns a safe empty result for empty transcript', () => {
    const result = runV2DryRunFromTranscript([]);
    expect(result.empty).toBe(true);
    expect(result.dryRunOnly).toBe(true);
    expect(result.sendStatus).toBe('not_sent');
    expect(result.rows).toEqual([]);
  });

  it('produces V2 dry-run rows from normal transcript', () => {
    const result = runV2DryRunFromTranscript(normalTranscript);
    expect(result.empty).toBe(false);
    expect(result.rows.length).toBe(2);
    expect(createV2PanelSnapshot(result)).toMatchObject({ dryRunOnly: true, sendStatus: 'not_sent', invariantStatus: 'pass' });
    expect(toV2PanelRows(result).every(row => row.dryRunOnly === true && row.sendStatus === 'not_sent')).toBe(true);
  });

  it('maps struggle and disconnected transcripts to safe support or reconnect behavior', () => {
    const struggle = runV2DryRunFromTranscript([
      { eventType: 'answer_wrong', status: 'accepted', robotCommand: 'encourage', reasonCodes: ['recent_wrong_answer'], privacyStatus: 'dữ liệu đã làm mờ/rút gọn' },
      { eventType: 'answer_wrong', status: 'accepted', robotCommand: 'encourage', reasonCodes: ['recent_wrong_answer'], privacyStatus: 'dữ liệu đã làm mờ/rút gọn' },
      { eventType: 'answer_wrong', status: 'accepted', robotCommand: 'encourage', reasonCodes: ['recent_wrong_answer'], privacyStatus: 'dữ liệu đã làm mờ/rút gọn' }
    ]);
    const disconnected = runV2DryRunFromTranscript([
      { eventType: 'bridge_error', status: 'accepted', robotCommand: 'neutral', reasonCodes: ['transport_unsafe'], privacyStatus: 'dữ liệu đã làm mờ/rút gọn' }
    ]);
    expect(['encourage', 'neutral']).toContain(createV2PanelSnapshot(struggle).lastCommand);
    expect(createV2PanelSnapshot(disconnected).lastCommand).toBe('neutral');
  });

  it('blocks sensitive/rejected transcript rows without raw sensitive output', () => {
    const result = runV2DryRunFromTranscript([
      { eventType: 'question_presented', status: 'rejected', privacyStatus: 'đã chặn bởi lớp bảo mật', reasonCodes: ['forbidden_companion_key'] }
    ]);
    const serialized = JSON.stringify(result);
    expect(result.rows[0]).toMatchObject({ v2Intent: 'calm_error', v2Command: 'neutral', v2Safety: 'blocked', dryRunOnly: true, sendStatus: 'not_sent' });
    ['private text', 'correctAnswer', 'sourceMetadata', 'backupPayload'].forEach(text => expect(serialized).not.toContain(text));
  });
});
