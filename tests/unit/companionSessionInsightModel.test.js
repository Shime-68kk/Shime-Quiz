import { describe, expect, it } from 'vitest';
import {
  createCompanionSessionInsight,
  insightContainsForbiddenData
} from '../../src/components/settings/companionSessionInsightModel.js';

describe('companionSessionInsightModel', () => {
  it('normal transcript gives calm/focus summary', () => {
    const insight = createCompanionSessionInsight([
      { eventType: 'session_started', status: 'accepted', privacyStatus: 'dữ liệu đã làm mờ/rút gọn' }
    ]);
    expect(insight.sessionMood).toContain('bình tĩnh');
    expect(insightContainsForbiddenData(insight)).toBe(false);
  });

  it('struggle transcript gives gentle support summary', () => {
    const insight = createCompanionSessionInsight([
      { eventType: 'answer_wrong', status: 'accepted', privacyStatus: 'dữ liệu đã làm mờ/rút gọn' },
      { eventType: 'answer_wrong', status: 'accepted', privacyStatus: 'dữ liệu đã làm mờ/rút gọn' }
    ]);
    expect(insight.sessionMood).toContain('gặp khó');
    expect(insight.supportStyle).toContain('nhẹ nhàng');
  });

  it('disconnected transcript gives neutral safe summary', () => {
    const insight = createCompanionSessionInsight([
      { eventType: 'bridge_error', status: 'accepted', privacyStatus: 'dữ liệu đã làm mờ/rút gọn' }
    ]);
    expect(insight.safetySummary).toContain('trung lập');
  });

  it('blocked transcript gives privacy/safety summary', () => {
    const insight = createCompanionSessionInsight([
      { eventType: 'question_presented', status: 'rejected', privacyStatus: 'đã chặn bởi lớp bảo mật' }
    ]);
    expect(insight.privacySummary).toContain('làm mờ/rút gọn');
    expect(insight.nextBestCompanionBehavior).toContain('không gửi lệnh');
  });
});

