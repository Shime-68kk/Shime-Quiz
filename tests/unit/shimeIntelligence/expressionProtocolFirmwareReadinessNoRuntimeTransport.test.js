import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

const files = [
  'src/shimeIntelligence/expressionProtocolReview.js',
  'src/shimeIntelligence/esp32ExpressionHostSimulator.js',
  'src/shimeIntelligence/esp32ExpressionReadinessContract.js',
  'src/shimeIntelligence/expressionProtocolCompatibilityMatrix.js',
  'src/shimeIntelligence/expressionProtocolGoldenFixtures.js',
  'src/shimeIntelligence/expressionProtocolFirmwareQaPlan.js',
  'src/shimeIntelligence/expressionProtocolMigrationPlan.js'
];

describe('expressionProtocolFirmwareReadinessNoRuntimeTransport', () => {
  it('does not import StudyRoom, DeviceBridge runtime, firmware, storage, network, or AI APIs', () => {
    const source = files.map(file => fs.readFileSync(file, 'utf8')).join('\n');
    ['src/routes/StudyRoom', 'src/deviceBridge', 'firmware/', 'localStorage', 'sessionStorage', 'indexedDB', 'fetch(', 'XMLHttpRequest', 'WebSocketTransport', 'OPENAI', 'ANTHROPIC', 'GEMINI', 'API_KEY', 'sendRobotCommand', 'emitStudyEvent', 'navigator.bluetooth', 'navigator.serial'].forEach(pattern => {
      expect(source).not.toContain(pattern);
    });
  });
});

