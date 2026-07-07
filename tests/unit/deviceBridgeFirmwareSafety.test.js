import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

const FIRMWARE_FILES = [
  'firmware/esp32-shime-robot/src/main.cpp',
  'firmware/esp32-shime-robot/src/ShimeProtocol.cpp',
  'firmware/esp32-shime-robot/src/ShimeRobotActions.cpp',
  'firmware/esp32-shime-robot/include/ShimeProtocol.h',
  'firmware/esp32-shime-robot/include/ShimeRobotActions.h',
  'firmware/esp32-shime-robot/platformio.ini'
];

const APP_RUNTIME_FILES = [
  'src/deviceBridge/deviceBridgeFacade.js',
  'src/deviceBridge/deviceBridgeRuntime.js',
  'src/deviceBridge/DeviceBridge.js',
  'src/deviceBridge/index.js',
  'src/deviceBridge/transports/WebSocketTransport.js',
  'src/components/settings/DeviceBridgeUiConcept.jsx',
  'src/routes/StudyRoom.jsx'
];

function read(relativePath) {
  return fs.readFileSync(resolve(PROJECT_ROOT, relativePath), 'utf8');
}

function readMany(relativePaths) {
  return relativePaths.map(file => ({ file, source: read(file) }));
}

describe('ESP32 firmware safety for serial parser QA', () => {
  it('firmware does not initialize Wi-Fi, WebSocket, Bluetooth, MQTT, HTTP, or credentials', () => {
    readMany(FIRMWARE_FILES).forEach(({ file, source }) => {
      [
        '#include <WiFi',
        'WiFi.begin',
        'WebSockets',
        'WebSocketServer',
        'BluetoothSerial',
        'BLEDevice',
        'PubSubClient',
        'HTTPClient',
        'const char* ssid =',
        'String ssid =',
        'password =',
        'WIFI_SSID',
        'WIFI_PASSWORD'
      ].forEach(pattern => {
        expect(source, `${file} should not contain active network credential/setup token ${pattern}`).not.toContain(pattern);
      });
    });
  });

  it('firmware does not enable pin, motor, servo, PWM, LED, or tone control', () => {
    readMany(FIRMWARE_FILES).forEach(({ file, source }) => {
      [
        'pinMode(',
        'digitalWrite(',
        'analogWrite(',
        'ledcWrite(',
        'Servo',
        '.attach(',
        '.write(',
        'tone('
      ].forEach(pattern => {
        expect(source, `${file} should not contain active hardware token ${pattern}`).not.toContain(pattern);
      });
    });
  });

  it('main loop reads newline-delimited serial input without blocking delay', () => {
    const source = read('firmware/esp32-shime-robot/src/main.cpp');

    expect(source).toContain('Serial.available()');
    expect(source).toContain("next == '\\n'");
    expect(source).toContain('MAX_SERIAL_LINE_LENGTH');
    expect(source).toContain('parseExpressionEnvelope(rawLine)');
    expect(source).toContain('logForExpressionResult(result)');
    expect(source).not.toContain('parseIncomingMessage(rawLine)');
    expect(source).not.toContain('responseForResult(result)');
    expect(source).not.toContain('routeAcceptedMessage(result)');
    expect(source).not.toContain('delay(');
  });

  it('app runtime files do not contain storage APIs or new non-transport hardware/network APIs', () => {
    readMany(APP_RUNTIME_FILES).forEach(({ file, source }) => {
      ['localStorage', 'sessionStorage', 'indexedDB', 'fetch', 'XMLHttpRequest', 'MQTT', 'Bluetooth', 'Serial', 'ESP32'].forEach(pattern => {
        expect(source, `${file} should not contain ${pattern}`).not.toContain(pattern);
      });
    });
  });

  it('StudyRoom and UI do not import firmware or serial QA tooling', () => {
    [
      'src/routes/StudyRoom.jsx',
      'src/components/settings/DeviceBridgeUiConcept.jsx'
    ].forEach(file => {
      const source = read(file);

      expect(source).not.toContain('serialParserQaFixtures');
      expect(source).not.toContain('ShimeProtocol');
      expect(source).not.toContain('esp32-shime-robot');
    });
  });
});
