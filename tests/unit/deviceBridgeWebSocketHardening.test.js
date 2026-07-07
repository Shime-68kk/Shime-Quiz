import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

function read(relativePath) {
  return fs.readFileSync(resolve(PROJECT_ROOT, relativePath), 'utf8');
}

function readMany(relativePaths) {
  return relativePaths.map(file => ({ file, source: read(file) }));
}

describe('Device Bridge Phase 18 hardening boundaries', () => {
  it('app runtime bridge/UI/StudyRoom files do not add forbidden network or storage APIs', () => {
    const files = [
      'src/deviceBridge/deviceBridgeFacade.js',
      'src/deviceBridge/deviceBridgeRuntime.js',
      'src/deviceBridge/DeviceBridge.js',
      'src/deviceBridge/index.js',
      'src/deviceBridge/transports/WebSocketTransport.js',
      'src/components/settings/DeviceBridgeUiConcept.jsx',
      'src/routes/StudyRoom.jsx'
    ];

    readMany(files).forEach(({ file, source }) => {
      ['localStorage', 'sessionStorage', 'indexedDB', 'fetch', 'XMLHttpRequest', 'MQTT', 'Bluetooth', 'Serial', 'ESP32'].forEach(pattern => {
        expect(source, `${file} should not contain ${pattern}`).not.toContain(pattern);
      });
    });
  });

  it('StudyRoom and UI are not coupled to WebSocket transport internals', () => {
    [
      'src/routes/StudyRoom.jsx',
      'src/components/settings/DeviceBridgeUiConcept.jsx'
    ].forEach(file => {
      const source = read(file);

      expect(source).not.toContain('WebSocketTransport');
      expect(source).not.toContain('createWebSocketTransport');
      expect(source).not.toContain('new WebSocket');
    });
  });

  it('UI does not emit raw study events directly', () => {
    const source = read('src/components/settings/DeviceBridgeUiConcept.jsx');

    expect(source).not.toContain('emitStudyEvent');
    expect(source).not.toContain('createSessionStartedEvent');
    expect(source).not.toContain('createAnswerCorrectEvent');
    expect(source).not.toContain('createAnswerWrongEvent');
  });

  it('raw WebSocket construction remains isolated to the transport implementation', () => {
    const appFiles = [
      'src/deviceBridge/deviceBridgeFacade.js',
      'src/deviceBridge/deviceBridgeRuntime.js',
      'src/deviceBridge/DeviceBridge.js',
      'src/deviceBridge/index.js',
      'src/components/settings/DeviceBridgeUiConcept.jsx',
      'src/routes/StudyRoom.jsx'
    ];

    readMany(appFiles).forEach(({ file, source }) => {
      expect(source, `${file} should not instantiate WebSocket`).not.toContain('new WebSocket');
      expect(source, `${file} should not read global WebSocket`).not.toContain('globalThis.WebSocket');
    });

    expect(read('src/deviceBridge/transports/WebSocketTransport.js')).toContain('globalThis.WebSocket');
  });

  it('firmware skeleton contains no pin control, actuator, or motion writes', () => {
    [
      'firmware/esp32-shime-robot/src/main.cpp',
      'firmware/esp32-shime-robot/src/ShimeProtocol.cpp',
      'firmware/esp32-shime-robot/src/ShimeRobotActions.cpp',
      'firmware/esp32-shime-robot/include/ShimeProtocol.h',
      'firmware/esp32-shime-robot/include/ShimeRobotActions.h'
    ].forEach(file => {
      const source = read(file);

      [
        'pinMode(',
        'digitalWrite(',
        'analogWrite(',
        'ledcWrite(',
        'Servo',
        '.write(',
        'tone('
      ].forEach(pattern => {
        expect(source, `${file} should not contain ${pattern}`).not.toContain(pattern);
      });
    });
  });

  it('firmware skeleton rejects private payload token names before acting', () => {
    const protocolSource = read('firmware/esp32-shime-robot/src/ShimeProtocol.cpp');

    [
      'prompt',
      'question',
      'answer',
      'correctAnswer',
      'explanation',
      'userAnswer',
      'sourceMetadata',
      'settings',
      'studyHistory',
      'backupPayload',
      'rawQuizPayload'
    ].forEach(pattern => {
      expect(protocolSource).toContain(pattern);
    });

    expect(protocolSource).toContain('containsJsonPropertyName');
    expect(protocolSource).toContain('sensitive_payload_detected');
  });

  it('firmware skeleton does not use raw substring matching for sensitive key detection', () => {
    const protocolSource = read('firmware/esp32-shime-robot/src/ShimeProtocol.cpp');

    expect(protocolSource).not.toContain('containsToken');
    expect(protocolSource).toContain('rawJson.charAt(cursor) ==');
    expect(protocolSource).toContain("':'");
  });

  it('firmware response envelopes include protocol-required fields', () => {
    const protocolSource = read('firmware/esp32-shime-robot/src/ShimeProtocol.cpp');
    const protocolHeader = read('firmware/esp32-shime-robot/include/ShimeProtocol.h');

    expect(protocolHeader).toContain('String messageId;');
    ['protocolVersion', 'messageId', 'messageType', 'emittedAt', 'source', 'payload'].forEach(field => {
      expect(protocolSource).toContain(`\\"${field}\\"`);
    });
    expect(protocolSource).toContain('1970-01-01T00:00:00.000Z');
  });
});
