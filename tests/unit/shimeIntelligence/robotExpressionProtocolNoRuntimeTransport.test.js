import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const files = [
  'src/shimeIntelligence/robotExpressionEnvelopeProtocol.js',
  'src/shimeIntelligence/robotExpressionEnvelopeSerializer.js',
  'src/shimeIntelligence/robotExpressionEnvelopeValidator.js',
  'src/shimeIntelligence/fakeExpressionTransportTranscript.js',
  'src/shimeIntelligence/esp32ExpressionLogContract.js',
  'src/shimeIntelligence/robotExpressionProtocolPipeline.js'
];

describe('robotExpressionProtocolNoRuntimeTransport', () => {
  it('does not import app routes, DeviceBridge runtime, firmware, storage, or live transport APIs', () => {
    const combined = files.map(file => fs.readFileSync(path.resolve(file), 'utf8')).join('\n');
    [
      'src/routes/StudyRoom',
      'src/deviceBridge',
      'firmware/',
      'localStorage',
      'sessionStorage',
      'indexedDB',
      'fetch(',
      'XMLHttpRequest',
      'WebSocketTransport',
      'emitStudyEvent',
      'sendRobotCommand',
      'navigator.bluetooth',
      'navigator.serial'
    ].forEach(pattern => {
      expect(combined).not.toContain(pattern);
    });
  });
});

