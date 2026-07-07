import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('shimeRobotExpressionNoRuntimeCoupling', () => {
  it('core expression modules avoid StudyRoom, DeviceBridge runtime, React, DOM, storage, network, AI, and send APIs', () => {
    const files = [
      'src/shimeIntelligence/robotExpressionContract.js',
      'src/shimeIntelligence/robotExpressionMapper.js',
      'src/shimeIntelligence/robotExpressionSafetyGate.js',
      'src/shimeIntelligence/robotCapabilityHandshake.js',
      'src/shimeIntelligence/robotExpressionPreview.js',
      'src/shimeIntelligence/shimeFusionQaHarness.js',
      'src/shimeIntelligence/shimeFusionManualQaModel.js'
    ];
    const source = files.map(file => fs.readFileSync(file, 'utf8')).join('\n');
    expect(source).not.toMatch(/from ['"].*StudyRoom|from ['"].*deviceBridge|from ['"].*DeviceBridge|from ['"]react|document\.|window\.|localStorage|sessionStorage|indexedDB|fetch|XMLHttpRequest|new WebSocket|WebSocketTransport|OPENAI|ANTHROPIC|GEMINI|API_KEY|sendRobotCommand|emitStudyEvent|new Notification|Notification\.requestPermission|navigator\.bluetooth|navigator\.serial/);
    expect(source).not.toContain('motionPolicy: "unlocked"');
  });
});
