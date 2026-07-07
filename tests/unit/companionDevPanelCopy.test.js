import { describe, expect, it } from 'vitest';
import {
  getCommandLabel,
  getCompanionLabel,
  getCompanionPanelCopy,
  getEventLabel,
  getReasonCodeLabel
} from '../../src/components/settings/companionDevPanelCopy.js';

describe('companionDevPanelCopy', () => {
  it('defaults to Vietnamese and falls back safely', () => {
    expect(getCompanionPanelCopy().title).toBe('Bảng thử nghiệm Trợ lý Đồng Hành — Chế độ Dev');
    expect(getCompanionPanelCopy('xx').title).toBe('Bảng thử nghiệm Trợ lý Đồng Hành — Chế độ Dev');
    expect(getCompanionLabel('missing_key')).toBe('không rõ');
  });

  it('provides English developer copy', () => {
    expect(getCompanionPanelCopy('en').title).toBe('Companion Brain Panel — Dev Mode');
    expect(getCompanionLabel('commandPreviewTitle', 'en')).toBe('Planned commands — preview only');
  });

  it('labels common events, commands, and reasons', () => {
    ['session_started', 'question_presented', 'answer_correct', 'answer_wrong', 'session_complete', 'bridge_error'].forEach(type => {
      expect(getEventLabel(type)).not.toBe(type);
    });
    expect(getCommandLabel('session_complete')).toBe('kết thúc buổi học');
    expect(getReasonCodeLabel('session_start')).toBe('bắt đầu phiên');
  });

  it('does not include sensitive raw display copy', () => {
    const serialized = JSON.stringify(getCompanionPanelCopy());
    ['correctAnswer', 'userAnswer', 'sourceMetadata', 'backupPayload'].forEach(text => {
      expect(serialized).not.toContain(text);
    });
  });
});

