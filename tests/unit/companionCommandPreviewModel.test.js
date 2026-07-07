import { describe, expect, it } from 'vitest';
import {
  commandPreviewContainsForbiddenData,
  createCompanionCommandPreview
} from '../../src/components/settings/companionCommandPreviewModel.js';

const transcript = [
  { step: 1, eventType: 'session_started', robotCommand: 'focus', reasonCodes: ['session_start'], safetyOutcome: 'allowed', privacyStatus: 'dữ liệu đã làm mờ/rút gọn' },
  { step: 2, eventType: 'answer_wrong', robotCommand: 'encourage', reasonCodes: ['study_focus'], safetyOutcome: 'allowed', privacyStatus: 'dữ liệu đã làm mờ/rút gọn' },
  { step: 3, eventType: 'question_presented', robotCommand: 'celebrate', reasonCodes: ['forbidden_companion_key'], safetyOutcome: 'blocked', privacyStatus: 'đã chặn bởi lớp bảo mật' }
];

describe('companionCommandPreviewModel', () => {
  it('creates dry-run command preview without sending', () => {
    const preview = createCompanionCommandPreview(transcript);

    expect(preview).toHaveLength(3);
    expect(preview.every(item => item.dryRunOnly === true)).toBe(true);
    expect(preview.every(item => item.sendStatus === 'not_sent')).toBe(true);
    expect(preview[0]).toMatchObject({ step: 1, sourceEvent: 'session_started', plannedCommand: 'focus' });
  });

  it('maps blocked safety to neutral command', () => {
    const preview = createCompanionCommandPreview(transcript);
    expect(preview[2].plannedCommand).toBe('neutral');
  });

  it('bounds preview list', () => {
    expect(createCompanionCommandPreview(transcript, { maxItems: 2 })).toHaveLength(2);
  });

  it('does not expose forbidden raw keys', () => {
    const preview = createCompanionCommandPreview(transcript);
    expect(commandPreviewContainsForbiddenData(preview)).toBe(false);
    expect(JSON.stringify(preview)).not.toContain('payload');
  });
});

