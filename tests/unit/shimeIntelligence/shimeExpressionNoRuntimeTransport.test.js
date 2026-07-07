import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('shimeExpressionNoRuntimeTransport', () => {
  it('expression UI/runtime files avoid transport, storage, AI, StudyRoom, DeviceBridge runtime, and send APIs', () => {
    const files = [
      'src/shimeIntelligence/fakeRobotExpressionRuntime.js',
      'src/shimeIntelligence/robotExpressionDisplayModel.js',
      'src/shimeIntelligence/robotExpressionEvidenceReview.js',
      'src/components/settings/robotExpressionPreviewPanelAdapter.js',
      'src/components/settings/fakeRobotConsoleModel.js',
      'src/components/settings/robotCapabilityPreviewModel.js',
      'src/components/settings/shimeExpressionManualQaModel.js'
    ];
    const source = files.map(file => fs.readFileSync(file, 'utf8')).join('\n');
    expect(source).not.toMatch(/from ['"].*StudyRoom|from ['"].*deviceBridge|from ['"].*DeviceBridge|localStorage|sessionStorage|indexedDB|fetch|XMLHttpRequest|new WebSocket|WebSocketTransport|OPENAI|ANTHROPIC|GEMINI|API_KEY|sendRobotCommand|emitStudyEvent|new Notification|Notification\.requestPermission|navigator\.bluetooth|navigator\.serial/);
    expect(source).not.toContain('motionPolicy: "unlocked"');
  });
});
