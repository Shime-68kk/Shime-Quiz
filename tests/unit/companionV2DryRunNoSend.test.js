import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { runV2DryRunFromTranscript } from '../../src/components/settings/companionV2PanelAdapter.js';

describe('companionV2DryRunNoSend', () => {
  it('does not expose send paths or transport APIs', () => {
    const files = [
      'src/components/settings/companionV2PanelAdapter.js',
      'src/components/settings/companionEngineComparisonModel.js',
      'src/components/settings/CompanionDevPanel.jsx'
    ];
    const source = files.map(file => fs.readFileSync(file, 'utf8')).join('\n');
    ['sendRobotCommand', 'emitStudyEvent', 'WebSocketTransport', 'new WebSocket', 'fetch(', 'XMLHttpRequest'].forEach(term => {
      expect(source).not.toContain(term);
    });
  });

  it('marks every planned command as not sent', () => {
    const result = runV2DryRunFromTranscript([{ eventType: 'session_started', status: 'accepted', privacyStatus: 'dữ liệu đã làm mờ/rút gọn' }]);
    expect(result.rows.every(row => row.sendStatus === 'not_sent' && row.dryRunOnly === true)).toBe(true);
  });
});
